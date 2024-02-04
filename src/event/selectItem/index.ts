import Konva from "konva";
import INLEDITOR from "@/index";
import { getCustomAttrs, getThingImage } from "@/main";
import layer from "@/util/layer";
import { changeImgState, groupNames } from "@/element";
import inputText from "@/element/texts/inputText";
import { getAncestorGroup } from "@/util/element/groups";
import {
  getSelectEle,
  getSelectNode,
  whetherIncloudInArr,
} from "@/util/element/chooseAnything";
import { getAncestorSon } from "@/util/getRelations";
import { createTran, resetEvent, setTransferNode } from "@/util/element/choose";
import { set } from "lodash";
import { turnDrag } from "@/util/line/rect";

// 如果不是拖动选择的子组
let nextGroup;
export const chooseAnything = (target: Konva.Node, ie: INLEDITOR) => {
  const stage = ie.getStage();
  let transformers = stage.findOne("Transformer") as Konva.Transformer;
  const { node: localThingGroup, type } = getSelectNode(target);
  const nodes: Array<Konva.Node> = [];
  const cursors = stage.find(".cursor");
  cursors.forEach((ele) => {
    inputText.blur(ele.parent);
  });
  const currentNodes = transformers?.getNodes() || [];
  let newGroup;
  const localAncestorGroup = getAncestorGroup(localThingGroup);
  // 是否在当前已选内
  let have = whetherIncloudInArr(
    getThingImage(localThingGroup) || localThingGroup,
    currentNodes
  );
  // 上次选择结果
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
      const lastSon = getAncestorSon(localThingGroup, ie.lastGroup);

      // 同源组最小节点
      if (
        ie.lastGroup === localThingGroup ||
        ie.lastGroup?.name() === "thingImage"
      ) {
        if (
          localThingGroup.name() === "thingGroup" &&
          ie.lastGroup.name() !== "thingImage"
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
        if (localAncestorGroup.name() !== "customImageGroup") {
          newGroup = localAncestorGroup;
        }

        nodes.push(...localAncestorGroup.children);
      }
    }
  }

  // 当前无选中
  if (!transformers) {
    transformers = createTran(localThingGroup, ie);
    layer(stage, "util").add(transformers);
    ie.lastGroup = newGroup;
    setTransferNode(transformers, nodes);
    ie.lastChooseMode = "single";
  }
  // 选中了新的
  else if (!have) {
    ie.lastGroup = newGroup;
    setTransferNode(transformers, nodes);
    ie.lastChooseMode = "single";
  }
};
export const chooseSomething = (target: Konva.Node, ie: INLEDITOR) => {};
export default (ie: INLEDITOR) => {
  const stage = ie.getStage();
  let begin;
  let state = "";

  stage.on("mouseup", (e: any) => {
    let transformers = stage.findOne("Transformer") as Konva.Transformer;
    const cbData: any = {
      operation: "",
    };
    if (e.evt.layerX === begin.layerX && e.evt.layerY === begin.layerY) {
      cbData.operation = "click";
    } else {
      cbData.operation = "drag";
    }
    // 点击 非拖动
    if (nextGroup && cbData.operation === "click") {
      if (nextGroup.node.name() !== "group") {
        setTransferNode(transformers, [nextGroup.node]);
        ie.lastChooseMode = "single";
      } else {
        setTransferNode(transformers, [...nextGroup.node.children]);
        ie.lastChooseMode = "single";
      }

      ie.lastGroup = nextGroup.node;
    }

    nextGroup = undefined;

    const res: Konva.Node[] = transformers?.getNodes();
    cbData.target = res;
    let type = "";
    if (ie.lastChooseMode === "multi") {
      type = "multi";
    } else if (ie.lastGroup) {
      type = ie.lastGroup.name();
      cbData.target = ie.lastGroup;
    } else if (res?.length === 1) {
      type = res[0].name();
      cbData.target = res[0];
    } else if (res?.length > 1) {
      type = "multi";
    } else {
      type = e.target.getClassName();
      cbData.target = e.target;
    }
    if (state !== "line") {
      ie.opt.onSelectCb(type, cbData);
    }
    state = "";
  });
  // mouse down先选组，mouse up时候如果还是当前，没拖动就选子组。
  stage.on("mousedown tap", (e) => {
    begin = e.evt;
    if (ie.getDrawState().toLocaleLowerCase().indexOf("line") !== -1) {
      state = "line";
      return;
    }
    // 预览选择输入框
    if (ie.opt.isPreview) {
      resetEvent(stage);
      if (e.target.getParent().name() === groupNames.thingInputGroup) {
        inputText.focus(e.target.getParent());
      }

      return;
    }
    const layer = e.target.getLayer();
    // 判断一下当元素类型 网格 连线控制点 框选 不处理
    if (
      e.target.getClassName() === "Stage" ||
      e.target.name() === "field" ||
      e.target.name() === "grid"
    ) {
      resetEvent(ie.getStage());
      ie.lastChooseMode = undefined;
      ie.lastGroup = undefined;
      return;
    }
    if (
      getCustomAttrs(e.target).type === "control" ||
      stage.attrs.drawState === "fieldSelect" ||
      e.target.parent.getClassName() === "Transformer"
    )
      return;

    // 如果点的画布外
    if (!layer) {
      resetEvent(stage);
      ie.opt.onSelectCb("stage", { target: e.target });
      return;
    }

    let Transformers = stage.findOne("Transformer") as Konva.Transformer;
    const currentNodes = Transformers?.getNodes() || [];
    if ((e.evt.ctrlKey || e.evt.metaKey) && Transformers) {
      Transformers.nodes([...currentNodes, getSelectEle(e.target).node]);
      ie.lastChooseMode = "multi";
    } else if (e.evt.shiftKey && Transformers) {
      const arr = currentNodes.map((node: Konva.Node) => {
        return getAncestorGroup(node);
      });
      //数组去重
      const newArr = Array.from(new Set(arr));
      const node = getAncestorGroup(e.target);
      Transformers.nodes([...newArr, node]);
      ie.lastChooseMode = "multi";
    } else {
      chooseAnything(e.target, ie);
    }

    const nodes = Transformers?.getNodes();
    if (
      nodes?.length === 1 &&
      nodes[0].name() === "thingGroup" &&
      nodes[0].draggable() === false
    ) {
      turnDrag(stage, false);
    } else {
      turnDrag(stage, true);
    }
  });
};
