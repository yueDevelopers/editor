import { Thing } from "../../data/thing";
import { createComponentThingGoup } from "@/element";
import { getCustomAttrs, setCustomAttrs } from "@/util/customAttr";
import layer from "../../util/layer";
import Konva from "konva";
import state from "./state";
import { UUID } from "@/util/uuid";
import INLEDITOR from "@/index";
import { getThingImage } from "@/util";
import { getTran, toSelectOne } from "@/util/element/choose";

interface BELT {
  stage: Konva.Stage;
  group: Konva.Group;
  thingGroup: Konva.Group;
  brect: Konva.Rect;
  brect1: Konva.Rect;
  brect2: Konva.Rect;
  beltCircle1: Konva.Circle;
  beltCircle2: Konva.Circle;
}

class BELT {
  constructor(
    stage: Konva.Stage,
    info: {
      thingInfo: Thing;
      p?: { x: number; y: number };
    }
  ) {
    this.stage = stage;
    this.createThingGroup(info.thingInfo, info.p);
    this.config.iu = info.thingInfo.iu;
  }
  name = "BELT";

  createThingGroup(thingInfo: Thing, p?: { x: number; y: number }) {
    if (p) {
      this.config.left = p.x;
      this.config.top = p.y;
    }
    const thingLayer = layer(this.stage, "thing");
    const thingGroup = thingLayer.findOne(`#${thingInfo.iu}`);

    if (!p) {
      this.thingGroup = thingGroup as Konva.Group;
      this.group = this.thingGroup.findOne(".thingImage");
      this.config.width =
        this.group.getClientRect().width / this.stage.scaleX();
      // 赋值缩放比例
      setCustomAttrs(this.group, {
        scale: this.config.width / this.config.defaultWidth,
      });
      for (let i = 0; i < this.group.children.length; i++) {
        this.group.children[i].destroy();
        i--;
      }
      this.draw.init();
    } else {
      this.group = new Konva.Group({
        width: this.config.width,
        height: this.config.height,
        draggable: false,
        name: "thingImage",
        componentName: this.name,
        id: UUID(),
      });
      this.thingGroup = createComponentThingGoup(
        thingLayer,
        thingInfo,
        this.group
      );
      this.thingGroup.setAttrs({
        x: this.config.left || 0,
        y: this.config.top || 0,
      });
      this.draw.init();
    }
  }
  config: any = {
    defaultWidth: 180,
    width: 180,
    height: 25,
    left: 0,
    top: 0,
    theme: 0,
    iu: undefined,
  };
  render(stateType: number) {
    this.config.theme = stateType;
    this.group.removeChildren();
    this.config.theme = getCustomAttrs(this.group).state || 0;
    this.draw.render(this.config.theme);
  }
  protected draw = {
    event: () => {
      this.group.on("transform", (e) => {
        this.group.off("transform");
        const { width, x, y } = getTran(this.stage).position!;
        this.config.width = (width * this.group.scaleX()) / this.stage.scaleX();
        this.config.left = x;
        this.config.top = y;
        // 赋值缩放
        setCustomAttrs(this.group, {
          scale: this.config.width / this.config.defaultWidth,
        });
        this.group.scale({
          x: 1,
          y: 1,
        });
        this.config.theme = getCustomAttrs(this.group).state || 0;
        this.group.removeChildren();
        this.draw.render(this.config.theme);
      });
    },
    init: () => {
      this.draw.render(0);
    },
    render: (stateType: number | string) => {
      const theme = state[stateType || 0];
      // 最大的
      this.brect = new Konva.Rect({
        fillLinearGradientStartPoint: { x: 0, y: 0 },
        fillLinearGradientEndPoint: { x: 0, y: this.config.height },
        fillLinearGradientColorStops: [
          0,
          theme.rect1.bj[0],
          0.3,
          theme.rect1.bj[1],
          1,
          theme.rect1.bj[2],
        ],
        width: this.config.width,
        height: this.config.height,
        cornerRadius: [13, 13, 26, 26],
        stroke: "black",
        name: "block",
        strokeWidth: 0.5,
      });

      this.brect1 = new Konva.Rect({
        x: 3,
        y: 3,
        fill: theme.rect2.bj[0],
        width: this.config.width - 6,
        height: this.config.height - 6,
        cornerRadius: [10, 10, 20, 20],
        stroke: "black",
        name: "brect1",
        strokeWidth: 0.5,
        draggable: false,
      });

      this.brect2 = new Konva.Rect({
        x: 6,
        y: 6,
        fillLinearGradientStartPoint: { x: 6, y: 6 },
        fillLinearGradientEndPoint: { x: 6, y: this.config.height - 6 },
        fillLinearGradientColorStops: [
          0,
          theme.rect3.bj[0],
          0.5,
          theme.rect3.bj[1],
          1,
          theme.rect3.bj[2],
        ],
        draggable: false,
        width: this.config.width - 12,
        height: this.config.height - 12,
        cornerRadius: [6, 6, 13, 13],
        stroke: theme.rect3.border,
        name: "brect2",
        strokeWidth: 1,
      });

      this.beltCircle1 = new Konva.Circle({
        x: 13,
        y: 12.5,
        radius: 5,
        fill: theme.round.bj[0],
        draggable: false,
        name: "beltCircle1",
      });
      this.beltCircle2 = new Konva.Circle({
        x: this.config.width - 13,
        y: 12.5,
        radius: 5,
        fill: theme.round.bj[0],
        draggable: false,
        name: "beltCircle2",
      });
      this.group.add(
        this.brect,
        this.brect1,
        this.brect2,
        this.beltCircle1,
        this.beltCircle2
      );

      setCustomAttrs(this.thingGroup, { state: this.config.theme });
      this.thingGroup.add(this.group);
      this.draw.event();
    },
  };
}
export const changeBeltState = (
  stage: Konva.Stage,
  stateType: string | number,
  iu: string
) => {
  const thingLayer = layer(stage, "thing");
  const thingGroup = thingLayer.findOne(`#${iu}`) as Konva.Group;
  const thingImage = thingGroup.findOne(`.thingImage`) as Konva.Group;
  const theme = state[stateType];
  const brect = thingImage.findOne(".block");
  const brect1 = thingImage.findOne(".brect1");
  const brect2 = thingImage.findOne(".brect2");
  const beltCircle1 = thingImage.findOne(".beltCircle1");
  const beltCircle2 = thingImage.findOne(".beltCircle2");
  brect.setAttrs({
    fillLinearGradientColorStops: [
      0,
      theme.rect1.bj[0],
      0.3,
      theme.rect1.bj[1],
      1,
      theme.rect1.bj[2],
    ],
  });
  brect1.setAttrs({
    fill: theme.rect2.bj[0],
  });
  brect2.setAttrs({
    stroke: theme.rect3.border,
    fillLinearGradientColorStops: [
      0,
      theme.rect3.bj[0],
      0.5,
      theme.rect3.bj[1],
      1,
      theme.rect3.bj[2],
    ],
  });
  beltCircle1.setAttrs({
    fill: theme.round.bj[0],
  });
  beltCircle2.setAttrs({
    fill: theme.round.bj[0],
  });
  const info = getCustomAttrs(thingGroup);
  info.state = stateType;
  return thingImage;
};

export const setBeltScale = (
  ie: INLEDITOR,
  iu: string,
  thingGroup,
  scale: number
) => {
  const thingImage = getThingImage(thingGroup);
  setCustomAttrs(thingImage, { scale });
  const comClass = ie.componentArr.find((ele) => ele.config.iu === iu);
  comClass.config.width = comClass.config.defaultWidth * scale;
  comClass.render(comClass.config.theme);
  toSelectOne(ie, thingImage);
};
export { BELT };

export default BELT;
