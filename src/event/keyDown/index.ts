import INLEDITOR from "@/index";
import { exitEditLine } from "@/util/line/editLine";
import stageTofit from "@/util/stageTofit";
import remove from "./remove";

export default (ie: INLEDITOR, cb?: () => void) => {
  const container = ie.getContainer();
  container.addEventListener("keydown", (e) => {
    if (e.code === "Backspace" || e.code === "Delete") {
      remove(ie, e);
      exitEditLine(ie.getStage());
    }
    if (e.code === "Space") {
      stageTofit(ie.getStage());
    }
    cb ? cb() : null;
  });
};
