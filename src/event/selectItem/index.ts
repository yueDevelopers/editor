import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { Shape, ShapeConfig } from "konva/lib/Shape";
import { Stage } from "konva/lib/Stage";
import INLEDITOR from "@/index";
import { IRect } from "konva/lib/types";
import { getCustomAttrs, getThingImage } from "@/main";
import layer from "@/util/layer";
import { getParentThingGroup } from "@/util/element";
import { groupNames } from "@/element";
import inputText from "@/element/texts/inputText";
import thing from "@/data/thing";
import { UUID } from "@/util/uuid";
import { getNodeSize } from "@/util/element/size";
import { getChooseGroup, getGroupNodes } from "@/util/element/group";
import { getAncestorGroup } from "@/util/element/groups";
import { getSelectNode } from "@/util/element/chooseAnything";
import { getAncestorSon } from "@/util/getRelations";

// 初始化选择框
export const createTran = (node: Konva.Node, ie: INLEDITOR) => {
  const name = node?.getAttrs().componentName;

  const opt: any = {
    id: UUID(),
    rotateEnabled: false,
    rotationSnaps: [0, 90, 180, 270],
  };
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
  const tran = new Konva.Transformer(opt);
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
// 上次选择的组
let lastGroup;
// 如果不是拖动选择的子组
let nextGroup;
export const chooseAnything = (target: Konva.Node, ie: INLEDITOR) => {
  const stage = ie.getStage();
  let Transformers = stage.findOne("Transformer") as Konva.Transformer;
  const { node: localThingGroup, type } = getSelectNode(target);
  const nodes: Array<Konva.Node> = [];
  const cursors = stage.find(".cursor");
  cursors.forEach((ele) => {
    inputText.blur(ele.parent);
  });
  const currentNodes = Transformers?.getNodes() || [];
  let newGroup;
  const localAncestorGroup = getAncestorGroup(localThingGroup);
  // 文字或者非设备图层
  if (type === "text" || localAncestorGroup.parent.name() !== "thing") {
    nodes.push(localThingGroup);
  } else {
    // 不在组内的元素
    if (localAncestorGroup === localThingGroup) {
      nodes.push(localThingGroup);
      if (
        localAncestorGroup.name() === "thingGroup" &&
        currentNodes.length === 1 &&
        currentNodes[0] === localThingGroup
      ) {
        nextGroup = {
          type: "thingImage",
          node: getThingImage(localThingGroup),
        };
      }
    } else {
      // 组内元素
      const lastSon = getAncestorSon(localThingGroup, lastGroup);

      // 同源组最小节点
      if (lastGroup === localThingGroup || lastGroup?.name() === "thingImage") {
        if (
          localThingGroup.name() === "thingGroup" &&
          lastGroup.name() !== "thingImage"
        ) {
          nodes.push(...currentNodes);
          nextGroup = {
            type: "thingImage",
            node: getThingImage(localThingGroup),
          };
        } else {
          nodes.push(...currentNodes);
          nextGroup = { type: "group", node: localAncestorGroup };
        }
      }
      // 同源组
      else if (lastSon) {
        nodes.push(...currentNodes);
        nextGroup = { type: "group", node: lastSon };
      } else {
        // 第一次选或选中不同源的组
        newGroup = localAncestorGroup;
        nodes.push(...localAncestorGroup.children);
      }

      // 选中同组，轮到最小thingGroup
      //   if (lastGroup?.name() === "thingGroup" && lastGroup === localThingGroup) {
      //     newGroup = getThingImage(localThingGroup);
      //     nodes.push(newGroup);
      //   } else if (lastSon && lastGroup.name() !== "thingImage") {
      //     // 选中同组，轮到子组
      //     newGroup = lastSon;
      //     nodes.push(...lastSon.children);
      //   } else {
      //     // 选中其他组或同组最小单位普通元素
      //     newGroup = localAncestorGroup;
      //     nodes.push(...localAncestorGroup.children);
      //   }
    }
  }

  if (!Transformers) {
    Transformers = createTran(localThingGroup, ie);
    layer(stage, "util").add(Transformers);
    Transformers.nodes(nodes);
    lastGroup = newGroup;
  }
};

export default (ie: INLEDITOR) => {
  const stage = ie.getStage();
  let begin;
  stage.on("mouseup", (e: any) => {
    let Transformers = stage.findOne("Transformer") as Konva.Transformer;
    // 点击 非拖动
    if (
      nextGroup &&
      e.evt.layerX === begin.layerX &&
      e.evt.layerY === begin.layerY
    ) {
      if (nextGroup.type === "thingImage") {
        Transformers.nodes([nextGroup.node]);
      } else {
        Transformers.nodes(nextGroup.node.children);
      }

      lastGroup = nextGroup.node;
    }
    nextGroup = undefined;
    const res: Konva.Node[] = Transformers?.getNodes();
    if (res.length > 1) {
      ie.opt.onSelectCb("group", { target: res });
    } else {
      ie.opt.onSelectCb(res[0].name(), { target: res[0] });
    }
  });
  // mouse down先选组，mouse up时候如果还是当前，先不拖动就选词组。
  stage.on("mousedown tap", (e) => {
    console.log("mousedown");
    begin = e.evt;
    if (e.target.attrs.state === "drag") {
      return;
    }
    // 预览选择输入框
    if (
      ie.opt.isPreview &&
      e.target.getParent().name() !== groupNames.thingInputGroup
    ) {
      resetEvent(stage);
      if (e.target.name() === groupNames.thingInputGroup) {
        inputText.focus(e.target);
      }
      return;
    }
    const layer = e.target.getLayer();
    // 判断一下当元素类型 网格 连线控制点 框选 不处理
    if (
      e.target.name() === "grid" ||
      getCustomAttrs(e.target).type === "control" ||
      stage.attrs.drawState === "fieldSelect"
    )
      return;

    // 如果点的画布外
    if (!layer) {
      resetEvent(stage);
      return;
    }
    chooseAnything(e.target, ie);
  });
};
