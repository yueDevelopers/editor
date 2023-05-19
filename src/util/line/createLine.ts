import Konva from "konva";
import INLEDITOR from "../..";
import computedXY, {
  computedPoint,
  computedXYByEvent,
} from "src/util/computedXY";
import layer from "src/util/layer";
import { KonvaEventObject } from "konva/lib/Node";
import { getMouseOver } from "../";
import { getCustomAttrs, getLineInfo, setCustomAttrs } from "../customAttr";
import { UUID } from "../uuid";
import { getLinePoints, mergeRightAngleLinePoint } from "./rightAngleLine";
import { getUsePoint, getUsePointUn } from "./line";
import { LineTheme } from "@/config/line";
import { lineState } from "../../config";
import { isComponentChild, isComponentChildren } from "@/component";
import { judge } from "../anchor";

// 创建线完成
export const finishLine = (
  stage: Konva.Stage,
  begin: Konva.Node,
  line: Konva.Arrow,
  lineType
) => {
  // 设备
  if (begin.className === "Image" && begin.parent?.nodeType === "Group") {
    begin.parent?.setAttrs({ draggable: true });
    //组件
  } else if (isComponentChildren(begin)) {
    begin.parent.parent.setAttrs({ draggable: true });
    begin = begin.parent;
  } else {
    begin.setAttrs({ draggable: true });
  }

  let pos = stage.getPointerPosition();
  let end = getMouseOver(pos!, stage);
  if (end?.attrs.componentName === "Technique") {
    if (!judge(stage, pos, end)) {
      end = undefined;
    }
  }
  if (begin === end) {
    end = undefined;
  }

  if (end) {
    end.setAttrs({ strokeWidth: 0 });
    const beginInfo = getLineInfo(begin);
    const endInfo = getLineInfo(end);
    const xya = computedXY(
      stage,
      begin.absolutePosition().x,
      begin.absolutePosition().y
    );
    const xyb = computedXY(
      stage,
      end.absolutePosition().x,
      end.absolutePosition().y
    );
    const data = {
      from: begin.id(),
      fromExcursionX: line.attrs.points[0] - xya.x,
      fromExcursionY: line.attrs.points[1] - xya.y,
      to: end.id(),
      toExcursionX: line.attrs.points[line.attrs.points.length - 2] - xyb.x,
      toExcursionY: line.attrs.points[line.attrs.points.length - 1] - xyb.y,
      type: lineType,
      state: lineState.default,
    };
    setCustomAttrs(line, {
      lineInfo: data,
    });
    beginInfo?.outLineIds?.push(line.id());
    endInfo?.inLineIds?.push(line.id());
    if (lineType.indexOf("rightAngle") >= 0) {
      const points = getUsePoint(line.attrs.points);
      const resPoints = mergeRightAngleLinePoint(points);
      // line.setAttrs({ points: getUsePointUn(resPoints) });
      line.points(getUsePointUn(resPoints));
    }
  } else {
    line.remove();
  }
};

// 创建线过程中移动
const createLineMove = (
  line: Konva.Arrow,
  point: { x: number; y: number },
  opt
) => {
  if (opt.drawState.toLowerCase().indexOf("rightangle") !== -1) {
    const res = getLinePoints(
      { x: line.attrs.points[0], y: line.attrs.points[1] },
      { x: point.x, y: point.y }
    );
    line.points(getUsePointUn(res));
  } else {
    line.attrs.points[2] = point.x;
    line.attrs.points[3] = point.y;
    line.points(line.attrs.points);
  }
};

// 开始创建线
export const beginCreateLine = (
  stage: Konva.Stage,
  point: { x: number; y: number },
  e: KonvaEventObject<MouseEvent>,
  opt
) => {
  // 设备
  if (e.target.className === "Image" && e.target.parent?.nodeType === "Group") {
    e.target.parent?.setAttrs({ draggable: false });
  }
  //组件
  if (isComponentChildren(e.target)) {
    e.target.parent.parent.setAttrs({ draggable: false });
  }
  if (e.target.name() === "selfShape" || e.target.className === "Text") {
    return;
  }
  e.target.setAttrs({ draggable: false });

  const lay = layer(stage, "line");
  lay.moveToTop();
  const line = createLine(lay, point, opt);
  let end;
  stage.on("mousemove", (e) => {
    const { x, y } = computedXYByEvent(stage, e.evt);
    if (line) {
      createLineMove(line!, { x, y }, opt);
      let pos = stage.getPointerPosition();
      if (end) {
        end.setAttrs({ strokeWidth: 0 });
      }
      end = getMouseOver(pos!, stage);
      if (end) {
        end.setAttrs({ stroke: "red", strokeWidth: 1 });
      }
    }
  });
  return line;
};

// 画出预览线
export const createLine = (
  layer: Konva.Layer,
  point: { x: number; y: number },
  opt
) => {
  const dotted = opt.drawState.toLowerCase().indexOf("dotted") !== -1;
  const arrow = new Konva.Arrow({
    id: UUID(),
    points: [point.x, point.y, point.x, point.y],
    ...LineTheme[opt.theme],
    pointerFill: "red",
    dash: dotted ? [15, 8, 15, 8] : undefined,
    stroke: lineState[opt.theme][lineState.default],
    fill: lineState[opt.theme][lineState.default],
  });

  layer.add(arrow);
  return arrow;
};
