import INLEDITOR from "../..";
import { closeSubLine, initSubLine } from "./subline";
import { dealRelation } from "../../util/element/relation";
import { getCustomAttrs, getThingImage, getTreeNodes } from "@/main";
import Konva from "konva";
import layer from "@/util/layer";
import { turnDrag } from "@/util/line/rect";

export default (ie: INLEDITOR, cb?: (node) => void) => {
  const stage: Konva.Stage = ie.getStage();
  let imgs = [];
  stage.on("dragstart", (e: any) => {
    const transformer: Konva.Transformer = stage.findOne("Transformer");
    const nodes = transformer?.getNodes();
    // turnDrag(stage, true);
    // 线随动
    if (nodes?.length > 1) {
      nodes.forEach((group: Konva.Group) => {
        if (group.name() === "thingGroup") {
          imgs.push(
            group.children.find(
              (node: Konva.Node) => node.name() === "thingImage"
            )
          );
        } else if (group.name() === "thingImage") {
          imgs.push(group);
        }
      });
    }
  });
  const dragmove = (e: any) => {
    if (e.target.name() === "field") {
      return;
    }
    // 启动辅助线
    if (getCustomAttrs(e.target).type !== "control") {
      initSubLine.bind(ie)(stage, e);
    }
    // 块关联线随动
    let target;
    if (
      e.target.nodeType === "Shape" ||
      e.target.nodeType === "Image" ||
      e.target.name() === "thingImage"
    ) {
      target = e.target;
    } else if (e.target.name() === "thingGroup") {
      target = e.target.children.find((ele) => ele.name() === "thingImage");
    }
    const transformer: Konva.Transformer = stage.findOne("Transformer");
    const nodes = transformer?.getNodes();
    if (nodes?.length > 1) {
      // if (e.target.getClassName() === "Transformer") {
      nodes.forEach((ele: Konva.Group) => {
        if (ele.name() === "thingGroup") {
          const img = ele.children.find(
            (ele: Konva.Node) => ele.name() === "thingImage"
          );
          dealRelation(img, ie.getStage(), imgs);
        } else if (ele.name() === "thingImage") {
          dealRelation(ele, ie.getStage(), imgs);
        } else if (ele.name() === "group") {
          const nodes = getTreeNodes(ele);
          nodes.forEach((node: Konva.Node) => {
            if (node.name() === "thingGroup") {
              const img = getThingImage(node as Konva.Group);
              dealRelation(img, ie.getStage(), imgs);
            }
          });
        }
      });
      // } else {
      //   const have = nodes.find((ele) => target?.parent.id() === ele.id());
      //   if (have) {
      //     return;
      //   }
      // }
    } else if (target) {
      dealRelation(target, ie.getStage());
    }
    // 取消选中没了

    // if (e.target !== stage && e.target.getClassName() !== "Transformer") {
    //   const { nodes } = getTran(stage);
    //   if (nodes.length === 1 && nodes[0] !== e.target) {
    //     clearTransFormer(stage);
    //   }
    // }

    cb ? cb(e.target) : null;
  };

  stage.on("dragmove", dragmove);
  const dragend = (e: any) => {
    e.target.attrs.state = undefined;
    // 网格吸附
    let target;
    if (e.target.name() === "thingGroup" && ie.opt.adsorbent) {
      target = e.target.children.find((ele) => ele.name() === "thingImage");
      const sumX = e.target.x() + target.x();
      const sumY = e.target.y() + target.y();
      const change = {
        x: Math.round(sumX / ie.opt.step) * ie.opt.step - sumX,
        y: Math.round(sumY / ie.opt.step) * ie.opt.step - sumY,
      };

      e.target.setAttrs({
        x: e.target.x() + change.x,
        y: e.target.y() + change.y,
      });
    }
    if (target) {
      dealRelation(target, ie.getStage());
    }

    stage.batchDraw();
    // 关闭辅助线
    closeSubLine.bind(ie)();
    // 历史
    const transformer: Konva.Transformer = stage.findOne("Transformer");
    const nodes = transformer?.getNodes();
    if (nodes?.length >= 1) {
      if (e.target.getClassName() !== "Transformer") {
        const have = nodes.find((ele) => e.target.id() === ele.id());
        if (have) {
          return;
        }
      }
    }
    ie.saveHistory();
    imgs = [];
  };
  stage.on("dragend", dragend);
};
