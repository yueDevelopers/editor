import Konva from "konva";
import { UUID } from "../uuid";
import INLEDITOR from "@/index";

export const getAncestorGroup = (node: Konva.Node) => {
  if (node.parent.getClassName() === "Layer") {
    return node;
  } else {
    return getAncestorGroup(node.parent);
  }
};

// export const getChooseGroup = (node: INLEDITOR) => {
//   const stage = ie.getStage();

//   return gid;
// };
export const getGroupNodes = (ie: INLEDITOR, groupId: string) => {
  return ie.thingLayer.children.filter((ele: Konva.Node) => {
    return ele.attrs.groupId === groupId;
  });
};

export const addGroup = (ie: INLEDITOR) => {
  const stage = ie.getStage();
  const Transformers = stage.findOne("Transformer") as Konva.Transformer;
  const group = new Konva.Group({
    id: UUID(),
    name: "group",
  });
  Transformers?.nodes().forEach((node: Konva.Group) => {
    if (
      node.name() === "thingGroup" ||
      node.name() === "selfShape" ||
      node.name() === "group"
    ) {
      group.add(node);
    }
  });
  ie.thingLayer.add(group);
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
