import Konva from "konva";
import INLEDITOR from "src";
import theme, { Theme } from "src/config/theme";
import { setThingGroupTheme } from "src/element/group";

export default function (
  this: INLEDITOR,
  themeType: Theme,
  callBack?: (stage: Konva.Stage) => {}
) {
  this.theme = themeType;

  // 修改thing 组的主题
  setThingGroupTheme(this.stage, this.theme);

  this.container.style.background = theme[themeType].background;
  // 可以由用户自己控制主题特定项目
  if (callBack) callBack(this.stage);
}
