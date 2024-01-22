import Konva from "konva";
import { UUID } from "../uuid";
import INLEDITOR from "@/index";
import btnImg from "../../assets/add.svg";
import { createImage } from "@/element";
import computedXY from "../computedXY";
import { getThingImage } from "..";

export const addBtn = async (ie: INLEDITOR, id: string) => {
  const stage = ie.getStage();
  const node: Konva.Group = stage.findOne("#" + id);
  const btn = await createImage(btnImg);
  const thingImage = getThingImage(node);
  const point =
    thingImage.getClassName() === "Group"
      ? { x: 0, y: 0 }
      : { x: thingImage.x(), y: thingImage.y() };
  btn.setAttrs({
    name: "addBtn",
    id: UUID(),
    x:
      point.x +
      (thingImage.width() * thingImage.scaleX()) / 2 -
      btn.width() / 2,
    y:
      point.y +
      (thingImage.height() * thingImage.scaleY()) / 2 -
      btn.height() / 2,
  });
  node.add(btn);
};

export const delBtn = (ie: INLEDITOR, id: string) => {
  const stage = ie.getStage();
  const node: Konva.Group = stage.findOne("#" + id);
  const btn = node.children.find((ele) => ele.name() === "addBtn");
  btn.destroy();
};
