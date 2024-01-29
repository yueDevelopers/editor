import resetImg from "./resetImg";
import resetText from "./resetText";
import INLEDITOR from "../../../index";
import { resetLine } from "@/util/line/border";
import resetComponents from "./resetComponents";
import layer from "@/util/layer";

export default async (ie: INLEDITOR) => {
  const stage = ie.getStage();
  await resetImg(stage.find("Image"));
  const lineLayer = layer(stage, "line");
  const lineArr = [...lineLayer.find("Arrow"), ...lineLayer.find("Line")];
  resetLine(ie, lineArr);
  resetText(stage);
  resetComponents(ie);
};
