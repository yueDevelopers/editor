import Konva from "konva";
import { UUID } from "../uuid";
import INLEDITOR from "@/index";

export const getTreeNodes = (group: Konva.Group) => {
  const arr = [];
  group.children.forEach((node: Konva.Node) => {
    if (node.name() === "group") {
      arr.push(...getTreeNodes(node as Konva.Group));
    } else {
      arr.push(node);
    }
  });
  return arr;
};

export const getAncestorGroup = (node: Konva.Node) => {
  if (node.parent.getClassName() === "Layer") {
    return node;
  } else {
    return getAncestorGroup(node.parent);
  }
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
      node.name() === "group" ||
      node.name() === "customImageGroup" ||
      node.name() === "selfText"
    ) {
      group.add(node);
    }
  });
  ie.thingLayer.add(group);
  ie.opt.onSelectCb(group.name(), { target: group });
};

export const delGroup = (ie: INLEDITOR) => {
  const stage = ie.getStage();
  const Transformers = stage.findOne("Transformer") as Konva.Transformer;
  const group = Transformers.getNodes()[0].parent;
  const oldArr = [];
  Transformers?.nodes().forEach((node: Konva.Group, index: number) => {
    oldArr.push(node.getAbsolutePosition());
    ie.thingLayer.add(node);
  });
  group.destroy();
  Transformers?.nodes().forEach((node: Konva.Group, index: number) => {
    node.setAbsolutePosition(oldArr[index]);
  });
  ie.opt.onSelectCb("multi", { target: Transformers?.nodes() });
};
