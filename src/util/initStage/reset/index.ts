import resetImg from "./resetImg";
import resetText from "./resetText";
import INLEDITOR from "../../../index";
import { resetLine } from "@/util/line/border";
import resetComponents from "./resetComponents";

export default async (ie: INLEDITOR) => {
  const stage = ie.getStage();
  await resetImg(stage.find("Image"));
  resetLine(ie);
  resetText(stage);
  resetComponents(ie);
};
