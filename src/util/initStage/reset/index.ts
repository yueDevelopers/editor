import resetImg from "./resetImg";
import resetText from "./resetText";
import INLEDITOR from "../../../index";
import { resetLine } from "@/util/line/border";
import resetComponents from "./resetComponents";
import layer from "@/util/layer";
import { getCustomAttrs } from "@/main";

export default async (ie: INLEDITOR) => {
  const stage = ie.getStage();
  await resetImg(stage.find("Image"));
  const lineLayer = layer(stage, "line");
  const lineArr = [...lineLayer.find("Arrow"), ...lineLayer.find("Line")];
  resetLine(ie, lineArr);
  resetText(stage);
  resetComponents(ie);
  stage.find(".thingGroup").forEach((group) => {
    const data = getCustomAttrs(group);
    if (data.lock) {
      group.setAttrs({ draggable: false });
    }
  });
};
