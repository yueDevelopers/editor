import { dealRelation } from "./relation";

export const setNodePosition = (node, position: { x?: number; y?: number }) => {
  if (node.name() === "thingGroup" || node.name() === "customImageGroup") {
    const target = node.children.find(
      (ele) => ele.name() === "thingImage" || ele.name() === "customImage"
    );
    const x = node.x() + target.x();
    const y = node.y() + target.y();
    const change = {
      x: (position.x === undefined ? x : position.x) - x,
      y: (position.y === undefined ? y : position.y) - y,
    };
    node.setAttrs({
      x: node.x() + change.x,
      y: node.y() + change.y,
    });
    if (node.name() === "thingGroup") {
      dealRelation(target, node.getStage());
    }
  } else {
    node.setAttrs({
      x: position.x ?? node.attrs.x,
      y: position.y ?? node.attrs.y,
    });
  }
};
export const getNodePosition = (node) => {
  if (node.name() === "thingGroup" || node.name() === "customImageGroup") {
    const target = node.children.find(
      (ele) => ele.name() === "thingImage" || ele.name() === "customImage"
    );
    const x = node.x() + target?.x();
    const y = node.y() + target?.y();

    return { x, y };
  } else {
    return { x: node.attrs.x || 0, y: node.attrs.y || 0 };
  }
};
