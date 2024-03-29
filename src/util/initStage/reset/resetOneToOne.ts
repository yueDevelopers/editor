import { createThingImageGroup } from "@/element";
import { BELT, Scraper, StoreHouse, Technique, getCustomAttrs } from "@/main";
import Konva from "konva";

export const resetOneToImage = async (thing, id, ie) => {
  const node: Konva.Group = ie.thingLayer.findOne("#" + id);
  let attrs;
  let texts = [];
  node.children.forEach((child: Konva.Node) => {
    if (child.name() === "thingImage") {
      attrs = child.attrs;
    } else {
      texts.push(child.clone());
    }
  });
  const thingGroup = await createThingImageGroup(
    ie.layerThing,
    thing,
    node.x(),
    node.y()
  );
  thingGroup.children[0].setAttrs({ ...attrs });
  texts.forEach((ele) => {
    thingGroup.add(ele);
  });
  node.remove();
};

export const resetImageToOne = (componentName, id, ie) => {
  const stage = ie.getStage();
  const node: Konva.Group = ie.thingLayer.findOne("#" + id);
  let attrs;
  let texts = [];
  let thingGroup;
  let customAttr = getCustomAttrs(node);
  let thingGroupAttr = node.attrs;
  node.children.forEach((child: Konva.Node) => {
    if (child.name() === "thingImage") {
      attrs = child.attrs;
    } else {
      texts.push(child.clone());
    }
  });
  if (componentName && componentName === "BELT") {
    const belt = new BELT(stage, {
      thingInfo: customAttr.thing,
      p: node.position(),
    });
    ie.componentArr.push(belt);
    thingGroup = belt.thingGroup;
  }
  if (componentName && componentName === "Scraper") {
    const scraper = new Scraper(stage, {
      thingInfo: customAttr.thing,
      p: node.position(),
    });
    ie.componentArr.push(scraper);
    thingGroup = scraper.thingGroup;
  }
  if (componentName && componentName === "Technique") {
    const technique = new Technique(stage, {
      thingInfo: customAttr.thing,
      p: node.position(),
    });
    thingGroup = technique.thingGroup;
  }
  if (componentName && componentName === "StoreHouse") {
    const storeHouse: StoreHouse = ie.getComponent("StoreHouse");
    thingGroup = storeHouse.add(customAttr.thing, node.position());
  }
  thingGroup.children[0].setAttrs({ ...attrs });
  thingGroup.setAttrs({ ...thingGroupAttr });
  texts.forEach((ele) => {
    thingGroup.add(ele);
  });
  node.remove();
};
