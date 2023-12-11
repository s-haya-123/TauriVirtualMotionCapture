// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
extern crate rosc;

mod vmcp;

use rosc::OscPacket;
use serde::Serialize;
use std::net::{SocketAddrV4, UdpSocket};
use std::str::FromStr;
use tauri::{App, Manager};

use std::thread;

use vmcp::{Address, BonePosition, ExtendesParser};

#[derive(Debug, Serialize)]
struct Message {
    bone: Vec<BonePosition>,
}

impl Message {
    fn is_empty(&self) -> bool {
        self.bone.is_empty()
    }
}

fn parse_osc_bundle(packet: OscPacket) -> Message {
    match packet {
        OscPacket::Message(_) => Message { bone: vec![] },
        OscPacket::Bundle(bundle) => {
            bundle
                .content
                .iter()
                .fold(Message { bone: vec![] }, |mut acc, packet| {
                    let m = parse_osc_message(packet);
                    match m {
                        Ok(address) => {
                            match address {
                                Address::Bone(bone) => acc.bone.push(bone),
                                Address::None => {}
                            }
                            acc
                        }
                        Err(_) => acc,
                    }
                })
        }
    }
}

fn parse_osc_message(packet: &OscPacket) -> Result<Address, String> {
    match packet {
        OscPacket::Message(msg) => {
            return msg.parse();
        }
        OscPacket::Bundle(_) => Err("想定と違うデータです".to_string()),
    }
}

fn receive_osc(app: &mut App) {
    let app_handle = app.app_handle();

    thread::spawn(move || {
        let addr = match SocketAddrV4::from_str("127.0.0.1:39539") {
            Ok(addr) => addr,
            Err(_) => panic!("Usage {} IP:PORT", "127.0.0.1:39539"),
        };
        let sock = UdpSocket::bind(addr).unwrap();
        println!("Listening to {}", addr);
        let mut buf = [0u8; rosc::decoder::MTU];
        loop {
            match sock.recv_from(&mut buf) {
                Ok((size, addr)) => {
                    println!("Received packet with size {} from: {}", size, addr);
                    let (_, packet) = rosc::decoder::decode_udp(&buf[..size]).unwrap();
                    let message = parse_osc_bundle(packet);
                    if !message.is_empty() {
                        app_handle.emit_all("OscPacket", &message).unwrap();
                    }
                }
                Err(e) => {
                    println!("Error receiving from socket: {}", e);
                    break;
                }
            }
        }
    });
}

fn main() {
    tauri::Builder::default()
        .setup(|app| {
            receive_osc(app);

            #[cfg(debug_assertions)] // only include this code on debug builds
            {
                let window = app.get_window("main").unwrap();
                window.open_devtools();
                window.close_devtools();
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
