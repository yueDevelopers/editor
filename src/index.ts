import Konva from "konva";
import UndoManager from "undo-manager";
import { ComponentFac, useComponent } from "./component/componentFac";
import {
  StoreHouse,
  VideoNode,
  Scale,
  Pool,
  setBeltScale,
  setScraperScale,
} from "./component";
import theme, { Theme } from "./config/theme";
import { groupNames, createThingGroup } from "./element/group";
import { changeThingComponentState, changeThingImage } from "./element/image";
import { createThingTexts } from "./element/text";
import event from "./event";
import stageClick, { getIus, onSelectCallBackFun } from "./event/stageClick";
import changeElementsPosition, {
  AlignType,
} from "./util/changeElementsPosition";
import changeTheme from "./util/changeTheme";
import { getCustomAttrs, getLineInfo, setCustomAttrs } from "./util/customAttr";
import { getRelations, getRelation } from "./util/getRelations";
import initStage from "./util/initStage";
import layer from "./util/layer";
import stageTofit from "./util/stageTofit";
import toImage from "./util/toImage";
import animate from "./animate/line";
import disableMove from "./util/initStage/disableMove";
import { Thing } from "./data/thing";
import { exitEditLine } from "./util/line/editLine";
import reset from "./util/initStage/reset";
import { showAnchor } from "./util/anchor";
import { setField } from "./util/element/setField";
import { FieldTheme } from "./config/field";
import { removeRelevance } from "./event/keyDown/remove";
import { getThingImage } from "./util";
import {
  changeLabelState,
  removeTextEle,
  resetTextEle,
  setTextVal,
} from "./element/texts/util";
import { thingTextInfo } from "./data/cdata";
import { keydown, keyup } from "./event/keyDown";
import { resetLine } from "./util/line/border";
import { addGrid, clearGrid } from "./util/element/grid";
import {
  resetImageToOne,
  resetOneToImage,
} from "./util/initStage/reset/resetOneToOne";
import { undoReset } from "./util/history";
import { addGroup } from "./util/element/groups";
import { setMaintainState, setSignToTop } from "./util/preview/maintain";
import { resetEvent } from "./util/element/choose";
import { loadTemplate } from "./util/element/loadTemplate";
import { addBtn } from "./util/element/addBtn";

export type DrawState =
  | "Line"
  | "dottedLine"
  | "rightAngleLine"
  | "rightAngleDottedLine"
  | "editLine"
  | "Rect"
  | "Text"
  | "img"
  | "drag"
  | "fieldSelect"
  | "default";

interface INLEDITOR {
  [ket: string]: any;
  opt: OPT;
  components: {
    [ket: string]: ComponentFac;
  };
}
enum SpecialCode {
  all = "allOfThem",
}

export type onDropCb = (
  s: Thing,
  p: { x: number; y: number },
  parent?: Konva.Group
) => void;
export type onDragCb = (node: Konva.Group) => void;

export type onCreateLineCb = (id: string) => void;

interface OPT {
  id: string;
  theme?: Theme;
  onDropCb?: onDropCb;
  onDragCb?: onDragCb;
  onCreateLineCb?: onCreateLineCb;
  onRemoveCb?: () => void;
  onTransform?: () => void;
  onSelectCb?: onSelectCallBackFun;
  onUndoCb?: () => void;
  isPreview?: boolean;
  json?: string;
  scale?: "show" | "hide";
  step?: number;
  adsorbent?: boolean;
}
class INLEDITOR {
  constructor(opt: OPT) {
    this.opt = opt;
    this.opt.adsorbent = this.opt.adsorbent === false ? false : true;
    this.opt.step = this.opt.step || 30;
    this.undoManager = new UndoManager();
  }
  async init(json?: string | null) {
    initStage(this, json);
    // 留存设备画布，避免重复获取，提高性能
    this.thingLayer = layer(this.stage, "thing");
    this.thingLayer.setAttrs({ draggable: false });
    setField(this);
    if (!this.opt.isPreview) {
      addGrid(this);
    }

    this.event();
    new ComponentFac(this.stage);
    if (this.opt.scale === "show" && !this.opt.isPreview) {
      this.use(new Scale(this));
    }
    this.use(new Pool(this.stage));
    this.use(new StoreHouse(this.stage));
    this.use(new VideoNode(this.stage));
    this.onStageChange(this);
    if (json) {
      await reset(this);
      this.stage.attrs.drawState = "default";
    }
    console.log("init");
    setTimeout(() => {
      // loadTemplate(this, json, { x: 100, y: 100 });
      // addBtn(this, "6157196859740463");
    }, 5000);
  }
  addTemplate = (json, point) => {
    loadTemplate(this, json, point);
  };
  keyUp = (e) => {
    keyup(e, this);
  };
  keyDown = (e) => {
    keydown(e, this);
  };
  storage = [];
  undoManager;
  // 操作记录
  historyArr = [];
  lastGroup;
  lastChooseMode;
  saveHistory = () => {
    const json = this.stage.toJSON();
    this.historyArr.push(json);
    this.undoManager.add({
      undo: async () => {
        if (this.historyArr.length <= 1) {
          return;
        }
        this.historyArr.pop();
        undoReset(this);
      },
      redo: async () => {
        this.historyArr.push(json);
        undoReset(this);
      },
    });
  };
  // 设备图层
  thingLayer;

  // 皮带刮板组件集合
  componentArr: any[] = [];

  // 主题
  protected theme: Theme = "dark";
  getTheme() {
    return this.theme;
  }

  // 注册时间
  protected event() {
    event(this);
  }

  resetGrid(step: number) {
    this.opt.step = step;
    clearGrid(this.stage);
    addGrid(this);
  }

  protected stage: Konva.Stage;

  getStage() {
    return this.stage || null;
  }
  setStage(c: Konva.Stage) {
    this.stage = c;
  }

  setField(stage, height: number, width: number) {
    const field: Konva.Node = stage.find(".field")[0];
    field.setAttrs({
      height,
      width,
    });
    clearGrid(this.stage);
    addGrid(this);
  }

  protected container: HTMLDivElement;
  getContainer() {
    return this.container || null;
  }
  setContainer(c: HTMLDivElement) {
    this.container = c;
  }
  // 绘制状态
  protected drawState: DrawState = "default";
  // 私有图片url或者虚线，间隔
  drawInfo: { type?: string; url?: string; dotted?: number[] };
  protected stateChangeCb: (state: DrawState) => void | undefined;
  onDrawStateChange(cb: (state: DrawState) => {}) {
    this.stateChangeCb = cb;
  }
  getDrawState() {
    return this.drawState;
  }

  // 设置画状态
  setDrawState(state: DrawState, info?: { type: string; url: string }) {
    this.drawState = state;
    this.drawInfo = info;
    if (state !== "drag") {
      exitEditLine(this.stage);
    }

    switch (state) {
      case "rightAngleLine":
      case "rightAngleDottedLine":
      case "dottedLine":
      case "Line":
        showAnchor(this.stage, "show");
        break;
    }
    this.stateChangeCb?.(state);
  }
  removeNode = (node: Konva.Group) => {
    node.remove();
    node.children.forEach((ele) => {
      if (ele.name() === "thingImage") {
        removeRelevance(ele, this.stage);
      }
    });
  };
  disableStageMove() {
    disableMove(this.stage);
  }
  // 创建thing文字
  createLineGroup = (line, useThing: Thing) => {
    if (line.parent.name() === "thingGroup") {
      const group = line.parent;
      setCustomAttrs(group, { thing: useThing });
      group.id("line" + useThing.iu);
    } else {
      const group = createThingGroup(useThing, "line" + useThing.iu);
      group.setAttrs({ draggable: false });
      const lineLay = layer(this.stage, "line");
      lineLay.add(group);
      group.add(line);
      return group;
    }
  };
  // 创建thing文字
  createThingText = (iu: string, type?: "thing" | "line") => {
    return createThingTexts(this, iu, this.theme);
  };
  setComponentScale = (iu: string, scale: number) => {
    const thingGroup: Konva.Group = this.stage.findOne("#" + iu);
    const thingImage = getThingImage(thingGroup);
    if (thingImage.attrs.componentName === "BELT") {
      setBeltScale(this, iu, thingGroup, scale);
    } else if (thingImage.attrs.componentName === "Scraper") {
      setScraperScale(this, iu, thingGroup, scale);
    }
  };

  // 修改主题
  changeTheme(themeType: Theme, cb?: (stage: Konva.Stage) => {}) {
    this.theme = themeType;
    if (this.opt.isPreview) {
      this.container.style.background = FieldTheme[themeType].fill;
    } else {
      this.container.style.background = theme[themeType].background;
    }

    const field: Konva.Node = this.getStage().find(".field")[0];
    field.setAttrs({ fill: FieldTheme[themeType].fill });
    const lineLayer = layer(this.stage, "line");
    const lineArr = [...lineLayer.find("Arrow"), ...lineLayer.find("Line")];
    resetLine(this, lineArr);
    changeTheme(this, themeType, cb);
  }
  // 预览挂牌
  previewMaintain(id: string, maintain: boolean, amount: number) {
    setMaintainState(this, id, maintain, amount);
  }

  // 动态修改物模型的值
  setVal(iu: string, propertyId: string, val: string, color?: string) {
    setTextVal(this.stage, iu, propertyId, val, color);
  }

  changeLabel = (iu: string, propertyId: string, val: boolean) => {
    changeLabelState(this.stage, iu, propertyId, val);
  };

  resetText(iu: string, propertyId: string, info: thingTextInfo, type: string) {
    resetTextEle(this, iu, propertyId, info, type);
  }

  resetTexts = (
    arr: { iu: string; propertyId: string; info: thingTextInfo; type: string }[]
  ) => {
    arr.forEach((ele) => {
      const { iu, propertyId, info, type } = ele;
      resetTextEle(this, iu, propertyId, info, type);
    });
  };

  removeText(iu: string, ids: Array<string | SpecialCode.all>) {
    removeTextEle(this, iu, ids);
  }
  // 组
  groups: any[] = [];
  createGroup() {
    addGroup(this);
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
  //查询设备状态
  getThingState(iu: string) {
    const thingBox = this.thingLayer.findOne(`#${iu}`);
    const { state } = getCustomAttrs(thingBox);
    return state;
  }

  cacheImgArr: { parentId: string; src: string; img: Konva.Node }[] = [];
  // 修改设备状态
  async setThingState(iu: string, setStateVal: string | number, src?: string) {
    const thingGroup = this.thingLayer.findOne(`#${iu}`);

    const image = thingGroup.children.find(
      (ele) => ele.name() === "thingImage" && ele.attrs.visible !== false
    );
    const { state } = getCustomAttrs(thingGroup);

    if (state === setStateVal) return;
    if (image.getClassName() !== "Image") {
      // 组件处理
      changeThingComponentState(this.stage, image, setStateVal);
    } else {
      const cData = getCustomAttrs(image.parent);
      cData.state = setStateVal;
      image ? await changeThingImage(image, src, this) : null;
    }
    setSignToTop(thingGroup);
  }

  // 注册组件
  use(component: ComponentFac) {
    useComponent(this, component);
  }

  getComponent<T extends ComponentFac>(s: string) {
    return (this.components[s] ? this.components[s] : {}) as T;
  }

  // 序列化
  toJson(source?: string) {
    if (source === "auto" && this.stage.findOne("Transformer")) {
      return { res: false };
    }

    exitEditLine(this.stage);
    resetEvent(this.stage);
    clearGrid(this.stage);
    const json = this.stage.toJSON();
    const image = this.toImage();
    addGrid(this);
    return { mapJson: json, image };
  }
  deleteAllPoint() {
    this.stage.find("Circle").forEach((point) => {
      point.remove();
    });
  }
  // 反序列化
  async loadJson(json?: string | null, cb?) {
    await this.init(json);
    cb ? cb() : "";
  }

  // 转换成图片
  toImage() {
    return toImage(this.stage, theme[this.theme].background);
  }

  // 通过ID获取已选codes
  getCodeById(iu: string) {
    const thingGroup: Konva.Group = this.stage.findOne("#" + iu);
    return getIus(thingGroup);
  }

  // 获取所有关系
  getRelations() {
    return getRelations(this.stage);
  }
  // 获取关系
  getRelation(line) {
    return getRelation(line, this.stage);
  }
  // 新版修改线样式
  updateLineOption(line, key, option: { color?: string; dotted?: number[] }) {
    const info = getLineInfo(line);
    info.state = key;
    if (option.color) {
      line.setAttrs({
        pointerFill: option.color,
        stroke: option.color,
        fill: option.color,
      });
    }
    line.setAttrs({
      dash: option.dotted,
    });
  }

  // 适应画布
  toFit() {
    stageTofit(this);
  }

  hasChange = false;

  // 舞台发生变化
  onStageChange = (ie, cb?: () => void) => {
    this.stage.on(
      "resize scale rotate wheel dragmove mouseUp mousedown",
      (e) => {
        if (ie.getDrawState() === "default") {
          return;
        }
        this.hasChange = true;
        // cb();
      }
    );
    this.stage.children.forEach((lay: Konva.Layer) => {
      lay.on("resize scale rotate wheel dragmove mousedown mouseup", () => {
        // cb();
        this.hasChange = true;
      });
    });
    this.container.addEventListener("keydown", () => {
      // cb();
      this.hasChange = true;
    });
    this.container.addEventListener("drop", () => {
      // cb();
      this.hasChange = true;
    });
  };
  changeElementsPosition(type: AlignType) {
    changeElementsPosition(this, type);
  }
  // 切换成图片
  resetOneToImageFun(thing, id) {
    return resetOneToImage(thing, id, this);
  }
  // 图片切换成其他
  resetImageToOneFun(componentName, id) {
    return resetImageToOne(componentName, id, this);
  }
  render(opt?: { width: number; height: number }) {
    if (opt) {
      this.stage.setAttrs({
        width: opt.width,
        height: opt.height,
      });
      // if (
      //   this.getComponent<Scale>("scale") &&
      //   Object.keys(this.getComponent<Scale>("scale")).length !== 0
      // ) {
      //   this.getComponent<Scale>("scale").render();
      // }
    }
    this.stage.draw();
  }
}

export const Animate = animate;
export default INLEDITOR;
