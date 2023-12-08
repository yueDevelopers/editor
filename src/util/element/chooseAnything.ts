import { groupNames } from "@/element";
import { getComponentGroup } from "@/main";
import Konva from "konva";

// 获取需要 框选的元素们
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
