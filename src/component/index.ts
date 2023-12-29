import Konva from "konva";
export { ComponentFac } from "./componentFac";

export * from "./belt";
export * from "./grid";
export * from "./scale";
export * from "./minmap";
export * from "./pool";
export * from "./video";
export * from "./scraper";
export * from "./storeHouse";
export * from "./technique";

export const getComponentGroup = (node: Konva.Node) => {
  const parent = node.parent;
  const parentName = parent.name();

  return parentName === "thingImage" ? parent.parent : undefined;
};

export const getComponentImage = (node: Konva.Node) => {
  const parent = node.parent;
  const parentName = parent.name();

  return parentName === "thingImage" ? parent : undefined;
};

export const isComponentChildren = (node: Konva.Node) => {
  return node?.parent?.parent?.name() === "thingGroup";
};

export const componentsName = ["POOL", "SCRAPER", "BELT", "ROUND_BUNKER"];
