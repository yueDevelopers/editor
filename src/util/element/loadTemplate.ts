import Konva from "konva";
import reset from "../initStage/reset";
import resetImg, { loadImage } from "../initStage/reset/resetImg";
import { resetComponent } from "../initStage/reset/resetComponents";
import { addBtn } from "./addBtn";
import { resetLine } from "../line/border";
import { dealRelation } from "./relation";
import { UUID } from "../uuid";

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
  // 线相关添加
  const lineLay = ie
    .getStage()
    .children.find((layer) => layer.name() === "line");

  const lineArr = [];
  for (let i = 0; i < tempLineLay.children.length; i++) {
    const node = tempLineLay.children[i];
    lineLay.add(node);
    i--;
    lineArr.push(...node.find("Arrow"), ...node.find("Line"));
  }
  resetLine(ie, lineArr);
  // 元素相关添加
  const thingArr = [];
  tempThingLay.find(".thingGroup").forEach((node) => {
    thingArr.push(node.id());
  });
  const imageArr = [];
  const tempThingLayChildren = [...tempThingLay.children];
  const group = new Konva.Group({
    id: UUID(),
    name: "group",
  });
  for (let i = 0; i < tempThingLayChildren.length; i++) {
    const node = tempThingLayChildren[i];
    console.log(node.getAbsolutePosition());
    if (node.getClassName() === "Group") {
      imageArr.push(...node.find("Image"));
    }

    group.add(node);
    resetComponent(ie, node);
  }
  ie.thingLayer.add(group);
  await resetImg(imageArr);
  group.setAbsolutePosition({
    x: point.x - min.x,
    y: point.y - min.y,
  });
  group.find(".thingImage").forEach((node) => {
    dealRelation(node, ie.getStage());
  });
  thingArr.forEach((id) => {
    addBtn(ie, id);
  });
};
