import { createImage } from "@/element";
import INLEDITOR from "@/index";
import maintainImg from "../../assets/maintain.svg";
import { getThingImage } from "..";
import Konva from "konva";
import { createText } from "@/element/texts";
import { UUID } from "../uuid";

const addMaintainSign = async (stage, thingGroup, amount) => {
  const thingImage = getThingImage(thingGroup);
  const position = thingImage.getAbsolutePosition();
  const img: Konva.Node = await createImage(maintainImg);
  img.setAttrs({
    name: "maintainSign",
    scaleX: thingImage.scaleX(),
    scaleY: thingImage.scaleY(),
  });
  // 牌牌宽度
  const signWidth = img.width() * 0.87;
  thingGroup.add(img);
  // 宽度一半减去牌牌一半
  img.setAbsolutePosition({
    x:
      position.x +
      thingImage.scaleX() *
        ((thingImage.width() - signWidth) * stage.scaleX()) *
        0.5,
    y:
      position.y +
      thingImage.scaleY() * thingImage.height() * stage.scaleX() * 0.382, // 黄金分割点
  });
  const text = createText({
    id: UUID(),
    fill: "#FF9214",
    fontSize: 15 * img.scaleX(),
    align: "center",
    name: "signNum",
    width: 16 * img.scaleX(),
    text: amount || 0,
  });
  thingGroup.add(text);
  const imgPosition = img.getAbsolutePosition();
  text.setAbsolutePosition({
    x: imgPosition.x + img.scaleX() * 70 * stage.scaleX(),
    y: imgPosition.y + img.scaleY() * 26 * stage.scaleX(),
  });
};

export const setSignToTop = (thingGroup) => {
  const signNum = thingGroup.findOne(".signNum");
  const maintainSign = thingGroup.findOne(".maintainSign");
  maintainSign?.moveToTop();
  signNum?.moveToTop();
};

export const setMaintainState = async (
  ie: INLEDITOR,
  id: string,
  maintain: boolean,
  amount: number
) => {
  const stage = ie.getStage();
  const thingGroup = ie.thingLayer.findOne("#" + id);
  if (maintain) {
    const signNum = thingGroup.findOne(".signNum");
    const maintainSign = thingGroup.findOne(".maintainSign");
    if (signNum) {
      maintainSign?.setAttrs({ visible: true });
      signNum?.setAttrs({ visible: true });
      signNum.text(amount);
    } else {
      await addMaintainSign(stage, thingGroup, amount);
    }
    setSignToTop(thingGroup);
  } else {
    const maintainSign = thingGroup.findOne(".maintainSign");
    const signNum = thingGroup.findOne(".signNum");
    maintainSign?.setAttrs({ visible: false });
    signNum?.setAttrs({ visible: false });
  }
};
