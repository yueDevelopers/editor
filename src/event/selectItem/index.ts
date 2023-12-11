import Konva from "konva";
import INLEDITOR from "@/index";
import { getCustomAttrs, getThingImage } from "@/main";
import layer from "@/util/layer";
import { groupNames } from "@/element";
import inputText from "@/element/texts/inputText";
import { getAncestorGroup } from "@/util/element/groups";
import { getSelectNode } from "@/util/element/chooseAnything";
import { getAncestorSon } from "@/util/getRelations";
import { resetEvent } from "@/util/element/choose";

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
    }
  }

  if (!Transformers) {
    Transformers = createTran(localThingGroup, ie);
    layer(stage, "util").add(Transformers);
  }
  lastGroup = newGroup;
  Transformers.nodes(nodes);
};
export const chooseSomething = (target: Konva.Node, ie: INLEDITOR) => {};
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
    if (lastGroup && lastGroup.name() === "group") {
      ie.opt.onSelectCb("group", { target: lastGroup });
    } else if (res.length > 1) {
      ie.opt.onSelectCb("multi", { target: res });
    } else {
      ie.opt.onSelectCb(res[0].name(), { target: res[0] });
    }
  });
  // mouse down先选组，mouse up时候如果还是当前，没拖动就选子组。
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
    let Transformers = stage.findOne("Transformer") as Konva.Transformer;
    if (e.evt.ctrlKey && Transformers) {
      11;
    } else if (e.evt.shiftKey && Transformers) {
      chooseSomething(e.target, ie);
    } else {
      chooseAnything(e.target, ie);
    }
  });
};
