import { groupNames } from "@/element";
import { getComponentGroup, getComponentImage } from "@/main";
import Konva from "konva";

// 获取需要 框选的组
export const getSelectNode = (selectTarget: Konva.Node) => {
  let resNode;
  if (
    selectTarget.getParent().name() === groupNames.thingTextGroup ||
    selectTarget.getParent().name() === groupNames.thingInputGroup ||
    selectTarget.getParent().name() === groupNames.thingSwitchGroup ||
    selectTarget.getParent().name() === groupNames.thingButtonGroup
  ) {
    resNode = { node: selectTarget.getParent(), type: "text" };
  } else if (selectTarget.name() === "thingImage") {
    resNode = { node: selectTarget.getParent(), type: "thingGroup" };
  } else if (getComponentGroup(selectTarget)) {
    resNode = { node: getComponentGroup(selectTarget), type: "thingGroup" };
  } else {
    resNode = { node: selectTarget, type: "other" };
  }
  return resNode;
};

// 获取需要 框选的元素
export const getSelectEle = (selectTarget: Konva.Node) => {
  let resNode;
  if (
    selectTarget.getParent().name() === groupNames.thingTextGroup ||
    selectTarget.getParent().name() === groupNames.thingInputGroup ||
    selectTarget.getParent().name() === groupNames.thingSwitchGroup ||
    selectTarget.getParent().name() === groupNames.thingButtonGroup
  ) {
    resNode = { node: selectTarget.getParent(), type: "text" };
  } else if (selectTarget.name() === "thingImage") {
    resNode = { node: selectTarget, type: "thingImage" };
  } else if (getComponentGroup(selectTarget)) {
    resNode = { node: getComponentImage(selectTarget), type: "thingImage" };
  } else {
    resNode = { node: selectTarget, type: "other" };
  }
  return resNode;
};

export const whetherIncloudInArr = (node: Konva.Node, arr: Konva.Node[]) => {
  let res = false;
  for (let i = 0; i < arr.length; i++) {
    const ele: Konva.Node = arr[i];
    if (node.id() === ele.id()) {
      res = true;
      break;
    }
    // if (ele.name() === "group") {
    if (
      ele.hasChildren() &&
      whetherIncloudInArr(node, (ele as Konva.Group).children)
    ) {
      res = true;
      break;
    }
    // }
  }
  return res;
};
