import Konva from "konva";
import reset from "../initStage/reset";
import resetImg, { loadImage } from "../initStage/reset/resetImg";
import { resetComponent } from "../initStage/reset/resetComponents";
import { addBtn } from "./addBtn";

export const loadTemplate = async (ie, json, point) => {
  const tempThingJson = json.children.find(
    (layer) => layer.attrs.name === "thing"
  );
  const tempLineJson = json.children.find(
    (layer) => layer.attrs.name === "line"
  );
  const tempThingLay = Konva.Node.create(tempThingJson);
  const tempLineLay = Konva.Node.create(tempLineJson);
  const min = { x: 9999, y: 9999 };
  [
    ...tempThingLay.find("Image"),
    ...tempThingLay.find("Rect"),
    ...tempThingLay.find("Text"),
  ].forEach((node) => {
    const position = node.getAbsolutePosition();
    if (position.x < min.x) {
      min.x = position.x;
    }
    if (position.y < min.y) {
      min.y = position.y;
    }
  });
  tempLineLay.children.forEach((node) => {
    const position = node.getClientRect();
    if (position.x < min.x) {
      min.x = position.x;
    }
    if (position.y < min.y) {
      min.y = position.y;
    }
  });

  const lineLay = ie
    .getStage()
    .children.find((layer) => layer.name() === "line");

  const thingArr = [];
  tempThingLay.find(".thingGroup").forEach((node) => {
    thingArr.push(node.id());
  });
  const ImageArr = [];
  const tempThingLayChildren = [...tempThingLay.children];
  for (let i = 0; i < tempThingLayChildren.length; i++) {
    const node = tempThingLayChildren[i];
    node.setAbsolutePosition({
      x: node.x() - min.x + point.x,
      y: node.y() - min.y + point.y,
    });
    console.log(node.getAbsolutePosition());
    if (node.getClassName() === "Group") {
      ImageArr.push(...node.find("Image"));
    }

    ie.thingLayer.add(node);
    resetComponent(ie, node);
  }
  // debugger;
  await resetImg(ImageArr);
  thingArr.forEach((id) => {
    addBtn(ie, id);
  });
  tempLineLay.children.forEach((node) => {
    node.setAbsolutePosition({
      x: node.x() - min.x + point.x,
      y: node.y() - min.y + point.y,
    });
    lineLay.add(node);
  });
};
