import { getCustomAttrs } from "@/main";
import computedXY from "@/util/computedXY";
import layer from "@/util/layer";
import Konva from "konva";
import drawCoal from "./drawCoal";
import { UUID } from "@/util/uuid";

interface COALANIM {
  autoPlay: boolean; // 是否自动播放
  animEl: Konva.Node; // 动画元素
  stage: Konva.Stage; // 舞台
  animGroup: Konva.Group; // 动画组
  cacheCoal: Konva.Star | Konva.Image; // 缓存煤炭
  tim: any; // 定时器
  startX: number; // 移动距离
  direction: "left" | "right"; // 煤炭移动方向
}

interface OPT {
  stage: Konva.Stage; // 舞台
  uuid: string; // 动画元素uuid
  imgUrl?: string; // 煤炭图片地址
  autoPlay?: boolean; // 是否自动播放
  direction?: "left" | "right"; // 煤炭移动方向
}
class COALANIM {
  constructor(opt: OPT) {
    const { autoPlay, stage, uuid, imgUrl, direction } = opt;
    this.autoPlay = autoPlay || false;
    this.stage = stage;

    this.init(autoPlay, uuid, imgUrl);
  }
  async init(autoPlay, uuid, imgUrl) {
    await this.reset(uuid, imgUrl);

    if (autoPlay) {
      this.start();
    }
  }

  startX = 0;
  clipGroup;

  async reset(uuid: string, imgUrl: string) {
    this.cacheCoal = await drawCoal(imgUrl);
    this.cacheCoal.cache();
    const layerthing = layer(this.stage, "thing");
    this.animEl = (layerthing.findOne(`#${uuid}`) as Konva.Group).findOne(
      ".thingImage"
    );

    if (!this.animEl) {
      new Error("未查询到元素，请检查查询条件.");
      return;
    }
    const backward = getCustomAttrs(this.animEl).backward;

    this.direction = backward ? "right" : "left";
    const { width, height } = this.animEl.getClientRect();
    const point = this.animEl.getAbsolutePosition();
    const { x, y } = computedXY(this.stage, point.x, point.y);
    this.startX = x;
    const scale = this.stage.scaleX();

    this.animGroup = new Konva.Group({
      width: width / scale,
      height: height / scale,
      x,
      y: y - height / scale,
    });

    this.clipGroup = new Konva.Group({
      clip: {
        x: x,
        y: y - height / scale,
        width: width / scale,
        height: height / scale,
        id: UUID(),
      },
      name: "clip",
    });
    this.clipGroup.add(this.animGroup);
    layerthing.add(this.clipGroup);
    layerthing.draw();

    this.addCoal();
    this.animInit();
    const state = getCustomAttrs(this.animEl).state;
    if (state === 1) {
      this.start();
    } else {
      this.stop();
    }
  }

  runState = false;
  tween; // 动画对象

  addCoal() {
    const { width } = this.animEl.getClientRect();
    for (let i = width / -30 - 1; i <= width / 30 + 1; i++) {
      const node = this.cacheCoal.clone() as Konva.Image;
      node.setAttrs({
        width: 30,
        height: 14,
      });
      node.setAttrs({
        x: 30 * i,
        y: 25 - node.height(),
      });
      this.animGroup.add(node);
    }
  }
  animInit() {
    const { width } = this.animEl.getClientRect();
    const scale = this.stage.scaleX();
    const point = this.animEl.getAbsolutePosition();
    const right = point.x + this.animEl.width() / scale;
    // left是从左往右
    if (this.direction !== "left") {
      this.animGroup.x(right);
    }
    this.tween = new Konva.Tween({
      node: this.animGroup,
      // rotation: 360,
      duration: 2,
      x: this.direction === "left" ? right : this.startX,
    });
    this.tween.play();
    this.tween.onFinish = () => {
      if (this.runState) {
        if (this.direction === "left") {
          this.animGroup.x(this.startX);
        } else {
          this.animGroup.x(right);
        }
        this.tween.reset();
        this.tween.play();
      }
    };
  }
  start() {
    if (this.runState) {
      return;
    }
    this.runState = true;
    this.clipGroup.setAttrs({ visible: true });
    this.tween.reset();
    this.tween.play();
  }
  stop() {
    this.runState = false;
    this.tween.pause();
    this.clipGroup.setAttrs({ visible: false });
  }
  destroy() {
    this.stop();
    console.log("煤动画销毁");
    this.animGroup.destroy();
  }
}

export { COALANIM };
