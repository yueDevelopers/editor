import {
  BELT,
  Pool,
  VideoNode,
  Scraper,
  StoreHouse,
  Technique,
} from "@/component";
import { getCustomAttrs } from "@/util/customAttr";
import layer from "@/util/layer";
import Konva from "konva";
import INLEDITOR from "../../../index";

export const resetComponent = (ie: INLEDITOR, item: Konva.Group) => {
  const { componentName } = item.getAttrs();
  const { thing } = getCustomAttrs(item.parent);
  if (componentName && componentName === "BELT") {
    ie.componentArr.push(new BELT(ie.getStage(), { thingInfo: thing, item }));
  }
  if (componentName && componentName === "Scraper") {
    ie.componentArr.push(
      new Scraper(ie.getStage(), { thingInfo: thing, item })
    );
  }
  if (componentName && componentName === "Technique") {
    new Technique(ie.getStage(), { thingInfo: thing });
  }
  if (componentName && componentName === "Pool") {
    const pool: Pool = ie.getComponent("Pool");
    pool.add(thing, undefined, item.parent as Konva.Group);
  }
  if (componentName && componentName === "StoreHouse") {
    const storeHouse: StoreHouse = ie.getComponent("StoreHouse");
    storeHouse.refreshImg(thing, item);
    storeHouse.add(thing, undefined, item.parent as Konva.Group);
  }
  if (componentName && componentName === "VideoNode") {
    const video: VideoNode = ie.getComponent("VideoNode");
    video.add(thing, undefined, ie.opt.isPreview, item.parent as Konva.Group);
  }
};

export default (ie: INLEDITOR) => {
  const thingLayer = layer(ie.getStage(), "thing");
  thingLayer.find(".thingImage").forEach((item: Konva.Group) => {
    resetComponent(ie, item);
  });
};
