
import { VRM, VRMHumanBoneName } from '@pixiv/three-vrm'


const boneName = [
    "RightHand",
    "RightLowerArm",
    "RightUpperArm",
    "RightShoulder",
    "LeftHand",
    "LeftLowerArm",
    "LeftUpperArm",
    "LeftShoulder",
    "RightUpperLeg",
    "RightLowerLeg",
    "RightToes",
    "LeftUpperLeg",
    "LeftLowerLeg",
    "LeftToes",
    "Hips",
    "Head",
] as const;


type BoneName = typeof boneName[number];

type Transform = {
    position: {
        x: number;
        y: number;
        z: number;
    };
    rotation: {
        x: number;
        y: number;
        z: number;
        w: number;
    }
};
type BonePosition = {
    transform: Transform;
    name: BoneName;
}

export type Message = {
    bone: readonly BonePosition[];
}

export const setPositionFromBonePosition = (boneArray: readonly BonePosition[], vrm: VRM | undefined) => {
    if (!vrm) {
        return;
    }
    for (const bone of boneArray) {
        const node = vrm.humanoid.getNormalizedBoneNode(VRMHumanBoneName[bone.name]);
        if (!!node) {
            const t = bone.transform;
            node.position.set(t.position.x, t.position.y, t.position.z);
            node.quaternion.set(-t.rotation.x, -t.rotation.y, t.rotation.z, t.rotation.w);
        }
    }
    vrm.humanoid.update();
}
