import { UUID } from "@/util/uuid";
import Konva from "konva";
import { TextConfig } from "konva/lib/shapes/Text";

export const createText = (config: TextConfig, id?: string) =>
  new Konva.Text({
    fontFamily: "Calibri",
    fill: "black",
    fontSize: 14,
    verticalAlign: "middle",
    id: id || UUID(),
    ...config,
  });
export const createInputDom = (config: TextConfig, id?: string) => {};
