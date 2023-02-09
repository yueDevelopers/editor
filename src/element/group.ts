import Konva from "konva";
import theme, { Theme } from "src/config/theme";
import { thingTextInfo } from "src/data/cdata";
import { Thing } from "src/data/thing";
import { setCustomAttrs } from "src/util/customAttr";
import layer, { LAYER } from "src/util/layer";

type groupNames = "thingGroup" | "thingTextGroup" | "thingDefTextGroup";
export const groupNames: Record<groupNames, groupNames> = {
  thingGroup: "thingGroup",
  thingTextGroup: "thingTextGroup",
  thingDefTextGroup: "thingDefTextGroup",
};
export type Parent = Konva.Group | Konva.Layer | Konva.Stage;
export type Child =
  | Konva.Group
  | Konva.Layer
  | Konva.Line
  | Konva.Circle
  | Konva.Rect
  | Konva.Text;

// 创建thing 的组
export const createThingGroup = (useThing: Thing) => {
  const group = new Konva.Group({
    draggable: true,
    id: useThing?.iu,
    name: groupNames.thingGroup,
  });
  setCustomAttrs(group, { thing: useThing, type: groupNames.thingGroup });
  return group;
};
// 查询thing的组
export const getThingGroups: (parent: Parent) => Array<Konva.Group> = (
  parent
) => {
  return parent.find(`.${groupNames.thingGroup}`);
};
export const getThingGroup: (parent: Parent, iu: string) => Konva.Group = (
  parent,
  iu
) => {
  return parent.findOne(`#${iu}`);
};

export interface createThingTextGroupData {
  labelv?: string;
  value: string;
  unitval?: string;
  code: string;
  x?: number;
  y?: number;
}

// 创建thingtext 的组
export const createThingTextGroup = (
  data: thingTextInfo,
  name: keyof typeof groupNames,
  position: { x: number; y: number }
) => {
  const { x, y } = position;
  const { code, v } = data;
  const group = new Konva.Group({
    name: name,
    draggable: true,
    code,
    x: x || 0,
    y: y || 0,
  });
  setCustomAttrs(group, {
    thingTextInfo: { code },
  });
  return group;
};

// 查询 thingText的租
export const getThingTextGroup = (
  stage: Konva.Stage | Konva.Group,
  name?: keyof typeof groupNames
) => {
  if (name) return stage.find<Konva.Group>(`.${name}`);
  return [
    ...stage.find<Konva.Group>(`.${groupNames.thingDefTextGroup}`),
    ...stage.find<Konva.Group>(`.${groupNames.thingTextGroup}`),
  ];
};

// 设置复杂thing text 的组主题
export const setThingTextGroupTheme = (ea: Konva.Group, themeType: Theme) => {
  const t = theme[themeType];
  const label = ea.findOne(".label");
  const rect = ea.findOne(".rect");
  const val = ea.findOne(".val");
  const unit = ea.findOne(".unit");

  label.setAttrs({
    fill: t.thingText.advanced.label.fill,
  });

  rect.setAttrs({
    fill: t.thingText.advanced.val.rectFill,
    stroke: t.thingText.advanced.val.rectStroke,
  });

  val.setAttrs({
    fill: t.thingText.advanced.val.fill,
  });

  unit.setAttrs({
    fill: t.thingText.advanced.unit.fill,
    opacity: t.thingText.advanced.unit.opacity,
  });
};

// 设置 Thing 组的样式
export const setThingGroupTheme = (stage: Konva.Stage, themeType: Theme) => {
  const thingLayer = layer(stage, LAYER.thing);
  getThingGroups(thingLayer).forEach((item) => {
    getThingTextGroup(item, groupNames.thingTextGroup).forEach((ea) => {
      setThingTextGroupTheme(ea, themeType);
    });
    // 还需要处理其他样式主题
  });
};
