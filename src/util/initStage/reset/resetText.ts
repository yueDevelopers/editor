import { getCustomAttrs } from "@/main";
import { UUID } from "@/util/uuid";
import Konva from "konva";

export default async (stage: Konva.Stage) => {
  stage.find(".selfText").map((text) => {
    if(!text.id()){
      text.setAttrs({ id: UUID() });
    }
    text.on("transform", (e) => {
      text.setAttrs({ width: text.width() * text.scaleX(), scaleX: 1 });
    });
  });
};
