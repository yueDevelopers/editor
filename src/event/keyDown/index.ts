import INLEDITOR from "@/index";
import { exitEditLine } from "@/util/line/editLine";
import stageTofit from "@/util/stageTofit";
import Konva from "konva";
import remove from "./remove";
import { groupNames } from "@/element";
import inputText from "@/element/texts/inputText";
import { UUID } from "@/util/uuid";
import { dealRelation } from "@/util/element/relation";
import { turnDrag } from "@/util/line/rect";
import { toSelectOne } from "@/util/element/choose";
import { getThingImage } from "@/main";

export const keydown = (e, ie) => {
  const stage = ie.getStage();
  const trans = stage.findOne("Transformer") as Konva.Transformer;
  const nodes = trans?.getNodes();
  if (ie.opt.isPreview) {
    const input = stage.findOne(".cursor");
    if (input) {
      inputText.keyIn(e, input.parent as Konva.Group);
    }
    return;
  }
  if (e.code === "Delete") {
    exitEditLine(ie.getStage());
    remove(ie, e);
  } else if (
    nodes?.length === 1 &&
    nodes[0].name() === groupNames.thingInputGroup
  ) {
    // 输入框
    inputText.keyIn(e, nodes[0] as Konva.Group);
  } else if (e.code === "Backspace") {
    exitEditLine(ie.getStage());
    remove(ie, e);
  } else if (e.code === "Space") {
    const eles = document.getElementById("myCanvas").children;
    Array.from(eles).forEach((element: HTMLElement) => {
      element.style.cursor = "grab";
    });
    turnDrag(stage, false);
    ie.getStage().setAttrs({ draggable: true });
  }
};
export const keyup = (e, ie) => {
  const stage = ie.getStage();
  if (e.code === "Space") {
    const eles = document.getElementById("myCanvas").children;
    Array.from(eles).forEach((element: HTMLElement) => {
      element.style.cursor = "default";
    });
    turnDrag(stage, true);
    ie.getStage().setAttrs({ draggable: false });
  } else if (e.code === "ArrowUp") {
    const transformers = ie.getStage().findOne("Transformer");
    const nodes = transformers?.getNodes();
    if (nodes.length >= 1) {
      nodes.forEach((ele) => {
        ele.y(ele.y() - 1);
        dealRelationByArrow(ele, ie);
      });
    }
  } else if (e.code === "ArrowDown") {
    const transformers = ie.getStage().findOne("Transformer");
    const nodes = transformers?.getNodes();
    if (nodes.length >= 1) {
      nodes.forEach((ele) => {
        ele.y(ele.y() + 1);
        dealRelationByArrow(ele, ie);
      });
    }
  } else if (e.code === "ArrowLeft") {
    const transformers = ie.getStage().findOne("Transformer");
    const nodes = transformers?.getNodes();
    if (nodes.length >= 1) {
      nodes.forEach((ele) => {
        ele.x(ele.x() - 1);
        dealRelationByArrow(ele, ie);
      });
    }
  } else if (e.code === "ArrowRight") {
    const transformers = ie.getStage().findOne("Transformer");
    const nodes = transformers?.getNodes();
    if (nodes.length >= 1) {
      nodes.forEach((ele) => {
        ele.x(ele.x() + 1);
        dealRelationByArrow(ele, ie);
      });
    }
  } else if (e.ctrlKey && e.code === "KeyZ") {
    // 撤销
    ie.undoManager.undo();
  } else if (e.ctrlKey && e.code === "KeyY") {
    // 撤销
    ie.undoManager.redo();
  } else if (e.ctrlKey && e.code === "KeyC") {
    const transformers = ie.getStage().findOne("Transformer");
    const nodes = transformers?.getNodes();
    if (nodes.length >= 1) {
      ie.storage = [];
      nodes.forEach((ele) => {
        if (
          ele.name() === "selfShape" ||
          ele.name() === "customImage" ||
          ele.name() === "selfText"
        ) {
          ie.storage.push(ele);
        }
      });
    }
  } else if (e.ctrlKey && e.code === "KeyV") {
    ie.storage.forEach((node: Konva.Node, index: number) => {
      const clone = node.clone();
      clone.setAttrs({
        id: UUID(),
        x: node.x() + 30,
        y: node.y() + 30,
      });
      ie.thingLayer.add(clone);
      ie.storage[index] = clone;
      if (clone.name() === "selfText") {
        clone.on("transform", (e) => {
          clone.setAttrs({ width: clone.width() * clone.scaleX(), scaleX: 1 });
        });
      }
      toSelectOne(ie, clone);
      ie.saveHistory();
    });
  }
};

const dealRelationByArrow = (node: Konva.Node, ie) => {
  if (node.name() === "thingImage") {
    dealRelation(node, ie.getStage());
  } else if (node.name() === "thingGroup") {
    dealRelation(getThingImage(node as Konva.Group), ie.getStage());
  }
};

export default (ie: INLEDITOR, bind?: boolean) => {
  const container = ie.getContainer();
  if (bind !== false) {
    container.addEventListener("keydown", ie.keyDown);
    container.addEventListener("keyup", ie.keyUp);
  } else {
    container.removeEventListener("keydown", ie.keyDown);
    container.removeEventListener("keyup", ie.keyUp);
  }
};
