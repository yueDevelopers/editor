import Konva from "konva";
import INLEDITOR from "@/index";
import layer from "../layer";
import { getCustomAttrs } from "../customAttr";
import { getTreeNodes, getTreeNodesAndGroup } from "../element/groups";

export const turnDrag = (stage: Konva.Stage, state: boolean) => {
  const lay = layer(stage, "thing");
  getTreeNodesAndGroup(lay)?.forEach((node: Konva.Node) => {
    if (node.name() !== "field" && node.name() !== "grid") {
      if (state) {
        const info = getCustomAttrs(node);
        if (!info.lock) {
          node.setAttrs({ draggable: state });
        }
      } else {
        node.setAttrs({ draggable: state });
      }
    }
  });
};
