import Konva from "konva";
import { useComponent } from "./component";
import Scale from "./component/scale";
import theme, { Theme } from "./config/theme";
import { getThingTextGroup, groupNames } from "./element/group";
import { changeImage } from "./element/image";
import { createThingText, setThingTextVal } from "./element/text";
import event from "./event";
import stageClick from "./event/stageClick";
import changeTheme from "./util/changeTheme";
import { getCustomAttrs, setCustomAttrs } from "./util/customAttr";
import initStage from "./util/initStage";
import layer from "./util/layer";
import stageTofit from "./util/stageTofit";
import toImage from "./util/toImage";

interface INLEDITOR {
  [ket: string]: any;
  stage: Konva.Stage;
  container: HTMLDivElement;
  opt: OPT;
  scale: Scale;
}

interface OPT {
  id: string;
  isPreview?: boolean;
  json?: string;
  scale?: "show" | "hide";
}
class INLEDITOR {
  constructor(opt: OPT) {
    this.opt = opt;
    this.init(opt.json);
  }
  init(json?: string) {
    initStage(this, json);
    this.event();
    if (this.opt.scale !== "show" && !this.opt.isPreview) {
      this.use(new Scale({}));
    }
  }

  // 主题
  theme: Theme = "dark";

  // 注册时间
  event = event.bind(this);

  // 绘制状态
  drawState: "Line" | "rightAngleLine" | "editLine" | "Rect" | "default" =
    "default";
  // 保存状态
  saveState: boolean = true;
  // 设置保存状态
  changeSaveStage(v: boolean) {
    this.saveState = v;
  }

  // 创建thing文字
  createThingText = (iu: string) => {
    return createThingText(this.stage, iu, this.theme);
  };

  // 修改主题
  changeTheme = changeTheme.bind(this);

  // 动态修改物模型的值
  setVal(iu: string, code: string, val: string) {
    // 查找物模型
    const thignGroup = layer(this.stage, "thing").findOne(
      `#${iu}`
    ) as Konva.Group;
    if (!thignGroup) return;
    // 筛选code
    getThingTextGroup(thignGroup).forEach((e) => {
      if (e.attrs.code && e.attrs.code === code) {
        setThingTextVal(e, val);
      }
    });
  }
  // 删除thing文字
  removeText(iu: string, code: string) {
    // 查找物模型
    const thignGroup = layer(this.stage, "thing").findOne(
      `#${iu}`
    ) as Konva.Group;
    // 筛选code
    getThingTextGroup(thignGroup).forEach((e) => {
      const attrs = e.getAttrs();
      if (attrs.code && attrs.code === code) {
        e.remove();
      }
    });
  }

  // 获取画布上所有物模型的id
  getAllIus() {
    const thingLayer = layer(this.stage, "thing");
    thingLayer.draw();
    const ius: Array<string> = [];
    thingLayer.getChildren().forEach((e) => {
      if (e.hasName(groupNames.thingGroup)) {
        const { iu } = getCustomAttrs(e).thing!;
        ius.push(iu);
      }
    });
    return ius;
  }

  // 动态修改图片
  changeImage(iu: string, src: string) {
    const thingLayer = layer(this.stage, "thing");

    const image = (thingLayer.findOne(`#${iu}`) as Konva.Group)?.findOne(
      "Image"
    ) as Konva.Image;
    image ? changeImage(image, src) : null;
  }

  // 注册组件
  use = useComponent.bind(this);

  // 序列化
  toJson() {
    const json = this.stage.toJSON();
    return json;
  }
  // 反序列化
  loadJson(json: string) {
    this.init(json);
  }

  // 转换成图片
  toImage() {
    return toImage(this.stage, theme[this.theme].background);
  }

  // 当画布元素被选中
  onselect = stageClick.bind(this);

  // 适应画布
  toFit() {
    stageTofit(this.stage);
  }

  render(opt?: { width: number; height: number }) {
    if (opt) {
      this.stage.setAttrs({
        width: opt.width,
        height: opt.height,
      });
      if (this.scale) {
        this.scale.render();
      }
    }
    this.stage.draw();
  }
}

export default INLEDITOR;
