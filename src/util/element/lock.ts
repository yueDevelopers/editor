import INLEDITOR from "@/index";
import Konva from "konva";
import { getCustomAttrs } from "../customAttr";

export const lockEle = (node: Konva.Node, state: boolean) => {
  let target;
  if (node.name() === "thingImage") {
    target = node.parent;
  } else {
    target = node;
  }
  const info = getCustomAttrs(target);
  info.lock = state;
  target.setAttrs({ draggable: !state });
};
export const getLockState = (node: Konva.Node) => {
  let target;
  if (node.name() === "thingImage") {
    target = node.parent;
  } else {
    target = node;
  }
  const info = getCustomAttrs(target);
  return info.lock;
};
