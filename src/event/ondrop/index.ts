import INLEDITOR from "@/index";
import dropThingImage from "./dropThingImage";
import customAddImage from "./customAddImage";
import computedXY, { computedXYByEvent } from "@/util/computedXY";

export default (
  ie: INLEDITOR,
  dom: HTMLElement,
  callback?: (e: DragEvent) => void
) => {
  const stage = ie.getStage();
  dom.ondragenter = function (e) {
    e.preventDefault();
  };

  dom.ondragover = function (e) {
    e.preventDefault();
  };

  dom.ondragleave = function (e) {
    e.preventDefault();
  };
  // 撤销待改
  dom.ondrop = (e) => {
    e.preventDefault();
    // 自定义组件拦截+回调
    const isCustomComponent = e.dataTransfer?.getData("customComponent");
    const data = e.dataTransfer?.getData("thing");
    const template = e.dataTransfer?.getData("template");
    if (isCustomComponent) {
      const { x, y } = computedXY(ie.getStage(), e.offsetX, e.offsetY);
      ie.opt.onDropCb
        ? ie.opt.onDropCb(JSON.parse(data).thing, { x, y })
        : null;
      return;
    }
    if (template) {
      // 模板
      ie.addTemplate(JSON.parse(template).style, computedXYByEvent(stage, e));
    } else if (e.dataTransfer.files.length > 0 && !data) {
      customAddImage(stage, e);
    } else if (data) {
      dropThingImage(stage, ie.getTheme(), e, ie.opt.onDropCb);
    } else {
    }

    callback ? callback(e) : null;
  };
};
