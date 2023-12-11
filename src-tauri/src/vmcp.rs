extern crate rosc;

use rosc::{OscMessage, OscType};
use serde::Serialize;

#[derive(Debug, Serialize)]
pub enum BonePositionName {
    RightHand,
    RightLowerArm,
    RightUpperArm,
    RightShoulder,
    LeftHand,
    LeftLowerArm,
    LeftUpperArm,
    LeftShoulder,
    RightUpperLeg,
    RightLowerLeg,
    RightToes,
    LeftUpperLeg,
    LeftLowerLeg,
    LeftToes,
    Hips,
    Head,
}

pub enum Address {
    Bone(BonePosition),
    None,
}
#[derive(Debug, Serialize)]
struct Position {
    x: f32,
    y: f32,
    z: f32,
}
#[derive(Debug, Serialize)]
struct Rotation {
    x: f32,
    y: f32,
    z: f32,
    w: f32,
}
#[derive(Debug, Serialize)]
pub struct Transform {
    position: Position,
    rotation: Rotation,
}

#[derive(Debug, Serialize)]
pub struct BonePosition {
    pub name: BonePositionName,
    pub transform: Transform,
}

pub trait ExtendesParser {
    fn parse(&self) -> Result<Address, String>;
}

impl ExtendesParser for OscMessage {
    fn parse(&self) -> Result<Address, String> {
        match self.addr.as_str() {
            "/VMC/Ext/Bone/Pos" => match parse_bone(&self.args) {
                Ok(v) => Ok(Address::Bone(v)),
                Err(e) => Err(e),
            },
            _ => Ok(Address::None),
        }
    }
}

macro_rules! value_impl {
    ($(($str:expr, $enum:ident)),*) => {
        fn match_bone_name(bone_string: String) -> Result<BonePositionName, String> {
            match bone_string.as_str() {
                $( $str => Ok(BonePositionName::$enum), )*
                _ => Err("NotDefineBone".to_string()),
            }
        }
    };
}
value_impl! {
    ("Head", Head),
    ("Hips", Hips),
    ("RightHand", RightHand),
    ("RightLowerArm", RightLowerArm),
    ("RightUpperArm", RightUpperArm),
    ("RightShoulder", RightShoulder),
    ("LeftHand", LeftHand),
    ("LeftLowerArm", LeftLowerArm),
    ("LeftUpperArm", LeftUpperArm),
    ("LeftShoulder", LeftShoulder),
    ("RightUpperLeg", RightUpperLeg),
    ("RightLowerLeg", RightLowerLeg),
    ("RightToes", RightToes),
    ("LeftUpperLeg", LeftUpperLeg),
    ("LeftLowerLeg", LeftLowerLeg),
    ("LeftToes", LeftToes)
}

fn parse_bone(args: &Vec<OscType>) -> Result<BonePosition, String> {
    let bone_name_result = match_bone_name(args[0].clone().string().unwrap());
    let bone_name = match bone_name_result {
        Ok(v) => v,
        Err(message) => return Err(message),
    };
    Ok(BonePosition {
        name: bone_name,
        transform: parse_transform(args),
    })
}

fn parse_transform(args: &Vec<OscType>) -> Transform {
    let position = Position {
        x: args[1].clone().float().unwrap(),
        y: args[2].clone().float().unwrap(),
        z: args[3].clone().float().unwrap(),
    };
    let rotation = Rotation {
        x: args[4].clone().float().unwrap(),
        y: args[5].clone().float().unwrap(),
        z: args[6].clone().float().unwrap(),
        w: args[7].clone().float().unwrap(),
    };
    Transform {
        position: position,
        rotation: rotation,
    }
}
