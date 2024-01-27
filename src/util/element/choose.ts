import Konva from "konva";
import INLEDITOR from "@/index";
import { UUID } from "../uuid";
import { groupNames } from "@/element";
import { IRect } from "konva/lib/types";
import inputText from "@/element/texts/inputText";
import layer from "../layer";

// 初始化选择框
export const createTran = (node: Konva.Node, ie: INLEDITOR) => {
  const tran = new Konva.Transformer(getTranOpt([node]));
  tran.on("transform", (e) => {
    if (e.target.name() === "selfShape" || e.target.name() === "customImage") {
      const width = e.target.width() * e.target.attrs.scaleX;
      const height = e.target.height() * e.target.attrs.scaleY;
      e.target.setAttrs({
        width,
        height,
        scaleX: 1,
        scaleY: 1,
      });
    }

    ie.opt.onTransform?.();
  });
  return tran;
};
// 获取 选择框
export const getTran: (stage: Konva.Stage) => {
  nodes: Array<Konva.Node>;
  Transformers: Konva.Transformer;
  position?: IRect;
} = (s) => {
  const Transformers = s.findOne("Transformer") as Konva.Transformer;
  if (!Transformers) return { nodes: [], Transformers: null };

  return {
    nodes: Transformers.getNodes(),
    position: Transformers.getClientRect(),
    Transformers,
  };
};
export const setTransferNode = (
  transform: Konva.Transformer,
  nodes: Konva.Node[]
) => {
  transform.nodes(nodes);
  transform.setAttrs(getTranOpt(nodes));
};
export const getTranOpt = (nodes: Konva.Node[]) => {
  const opt: any = {
    id: UUID(),
    rotateEnabled: false,
    rotationSnaps: [0, 90, 180, 270],
    resizeEnabled: true,
  };
  if (nodes.length === 1) {
    const node = nodes[0];
    const name = node?.getAttrs().componentName;

    if (name === "BELT" || name === "Scraper" || name === "Technique") {
      opt.enabledAnchors = ["middle-right"];
      opt.rotateEnabled = false;
    } else if (node?.className === "Arrow") {
      opt.draggable = false;
      opt.resizeEnabled = false;
    } else if (
      node?.name() === "thingImage" ||
      node?.name() === groupNames.thingTextGroup ||
      node?.name() === groupNames.thingInputGroup ||
      node?.name() === groupNames.thingButtonGroup ||
      node?.name() === groupNames.thingSwitchGroup
    ) {
      opt.enabledAnchors = [
        "top-left",
        "top-right",
        "bottom-left",
        "bottom-right",
      ];
    } else if (node?.name() === "selfText") {
      opt.enabledAnchors = ["middle-left", "middle-right"];
    } else if (node?.name() === "customImage" || node?.name() === "selfShape") {
    } else {
      opt.resizeEnabled = false;
    }
  } else {
    opt.resizeEnabled = false;
  }
  return opt;
};
// 重置事件中心
export const resetEvent = (stage: Konva.Stage) => {
  const Transformers = stage.findOne("Transformer") as Konva.Transformer;
  Transformers?.nodes().forEach((node) => {
    if (node.name() === "thingImage") {
      node.setAttrs({ draggable: false });
    }
  });
  const cursors = stage.find(".cursor");
  cursors.forEach((ele) => {
    inputText.blur(ele.parent);
  });
  Transformers?.remove();
  Transformers?.destroy();
};

export const clearTransFormer = (stage: Konva.Stage) => {
  const Transformers = stage.findOne("Transformer") as Konva.Transformer;
  Transformers?.remove();
  Transformers?.destroy();
  stage.draw();
};

export const toSelectOne = (ie: INLEDITOR, node: Konva.Node, cb?) => {
  const stage = ie.getStage();
  resetEvent(stage);
  const Transformers = createTran(node, ie);
  Transformers.nodes([node]);
  layer(stage, "util").add(Transformers);
  cb?.("things", {}, {});
  return Transformers;
};

export const toSelect = (ie: INLEDITOR, nodes: Array<Konva.Node>, cb?) => {
  if (nodes.length === 0) return;
  const stage = ie.getStage();
  resetEvent(stage);
  const Transformers = createTran(undefined, ie);
  Transformers.nodes(nodes);
  layer(stage, "util").add(Transformers);
  cb?.(
    "things",
    {
      target: nodes,
    },
    {}
  );
  return Transformers;
};
