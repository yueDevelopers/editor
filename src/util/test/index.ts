import computedXY from "../computedXY";
import { getCustomAttrs, getLineInfo, setCustomAttrs } from "../customAttr";
import { createLine } from "../line/createLine";
import { getUsePoint, getUsePointUn } from "../line/line";
import {
  getLinePoints,
  mergeRightAngleLinePoint,
} from "../line/rightAngleLine";
import { lineState } from "../../config";
import { createThingGroup, createThingImageGroup } from "@/element";
import { addLineBorder } from "../line/border";
import { createThingTextByGroup } from "@/element/text";

export const addLine = (ie, begin, end, drawState = "rightAngleLine") => {
  const stage = ie.getStage();
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
  // const pointStart = begin.absolutePosition();
  // const pointEnd = end.absolutePosition();
  const line = createLine(ie, xya, { drawState, theme: ie.getTheme() });
  const res = getLinePoints(
    { x: line.attrs.points[0], y: line.attrs.points[1] },
    { x: xyb.x, y: xyb.y }
  );
  line.points(getUsePointUn(res));
  const beginInfo = getLineInfo(begin);
  const endInfo = getLineInfo(end);

  const data = {
    from: begin.id(),
    fromExcursionX: line.attrs.points[0] - xya.x,
    fromExcursionY: line.attrs.points[1] - xya.y,
    to: end.id(),
    toExcursionX: line.attrs.points[line.attrs.points.length - 2] - xyb.x,
    toExcursionY: line.attrs.points[line.attrs.points.length - 1] - xyb.y,
    type: drawState,
    state: lineState.default,
  };
  setCustomAttrs(line, {
    lineInfo: data,
  });
  const group = createThingGroup({});
  group.setAttrs({ draggable: false });
  line.getLayer().add(group);
  group.add(line);
  if (drawState.toLowerCase().indexOf("dotted") === -1) {
    addLineBorder(line, ie);
  }

  beginInfo?.outLineIds?.push(line.id());
  endInfo?.inLineIds?.push(line.id());
  if (drawState.indexOf("rightAngle") >= 0) {
    const points = getUsePoint(line.attrs.points);
    const resPoints = mergeRightAngleLinePoint(points);
    line.setAttrs({ points: getUsePointUn(resPoints) });
  }
  const cb = ie.opt.onCreateLineCb;
  cb?.(line.id());
};
export const addThingImage = (data, point, ie) => {
  const { thing, thingText } = data;
  const layerThing = ie.thingLayer;
  const { x, y } = point;
  const themeType = ie.theme;
  const cb = ie.opt.onDropCb;
  createThingImageGroup(layerThing, thing, x, y).then((group) => {
    if (thingText) {
      createThingTextByGroup(group, thingText, themeType);
    }
    cb ? cb(getCustomAttrs(group).thing, { x, y }, group) : null;
  });
};
