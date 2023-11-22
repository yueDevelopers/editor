import Konva from "konva";
import { UUID } from "../uuid";
import INLEDITOR from "@/index";

export const getChooseGroup = (ie: INLEDITOR) => {
  const stage = ie.getStage();
  const Transformers = stage.findOne("Transformer") as Konva.Transformer;
  const nodes = Transformers?.nodes();
  let gid = nodes?.[0]?.attrs.groupId;
  if (gid) {
    for (let index: number = 0; index < nodes.length; index++) {
      const item = nodes[index];
      if (item.attrs.groupId !== gid) {
        gid = undefined;
        break;
      }
    }
  }
  return gid;
};
export const getGroupNodes = (ie: INLEDITOR, groupId: string) => {
  return ie.thingLayer.children.filter((ele: Konva.Node) => {
    return ele.attrs.groupId === groupId;
  });
};

export const addGroup = (ie: INLEDITOR) => {
  const stage = ie.getStage();
  const Transformers = stage.findOne("Transformer") as Konva.Transformer;
  const gid = UUID();
  Transformers?.nodes().forEach((node: Konva.Group) => {
    if (node.name() === "thingGroup" || node.name() === "selfShape") {
      node.attrs.groupId = gid;
    }
  });
};

export const delGroup = (ie: INLEDITOR) => {
  const stage = ie.getStage();
  const Transformers = stage.findOne("Transformer") as Konva.Transformer;
  Transformers?.nodes().forEach((node: Konva.Group) => {
    if (node.name() === "thingGroup" || node.name() === "selfShape") {
      node.attrs.groupId = undefined;
    }
  });
};
