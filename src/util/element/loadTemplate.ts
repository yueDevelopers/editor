import Konva from "konva";
import reset from "../initStage/reset";
import resetImg from "../initStage/reset/resetImg";

export const loadTemplate = (ie, json, point) => {
  const tempThingJson = json.children.find(
    (layer) => layer.attrs.name === "thing"
  );
  const tempLineJson = json.children.find(
    (layer) => layer.attrs.name === "line"
  );
  const tempThingLay = Konva.Node.create(tempThingJson);
  const tempLineLay = Konva.Node.create(tempLineJson);
  const lineLay = ie
    .getStage()
    .children.find((layer) => layer.name() === "line");
  resetImg(tempThingLay);
  tempThingLay.children.forEach((node) => {
    node.setAttrs({ x: node.x() + point.x, y: node.y() + point.y });
    ie.thingLayer.add(node);
  });
  tempLineLay.children.forEach((node) => {
    node.setAttrs({ x: node.x() + point.x, y: node.y() + point.y });
    lineLay.add(node);
  });
};
