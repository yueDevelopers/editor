import Konva from "konva";
import { computedDuration } from "../../util/distance";
import LineAnimate from ".";
import { aniLineState, lineAni } from "../../config";
import { getLineInfo } from "@/util/customAttr";

export default function (this: LineAnimate) {
  const lineInfo = getLineInfo(this.opt.line);
  this.animateEl = new Konva.Line(this.opt.line.getAttrs());
  this.animateLayer.add(this.animateEl);
  let animate;
  const sign = this.opt.direction === "obey" ? 1 : -1;
  let points = JSON.parse(JSON.stringify(this.opt.line.points())) || [];
  const { distance } = computedDuration(points, this.speed);
  const theme = this.opt.ie.getTheme();
  this.animateEl.setAttrs({
    ...lineAni.flow[theme],
    stroke: aniLineState[theme][lineInfo.state],
    dash: [distance],
    dashOffset: distance,
  });
  const init = () => {
    animate = new Konva.Tween({
      node: this.animateEl,
      dashOffset: sign ? 0 : distance * sign,
      duration: this.speed,
      onFinish: () => {
        this.animateEl.setAttrs({ dashOffset: distance });
        init();
      },
    });
    animate.play();
  };
  this.start = () => {
    if (animate) {
      animate.play();
    } else {
      init();
    }
  };
  this.stop = () => {
    animate.pause();
  };
  this.destroy = () => {
    animate.pause();
    this.animateEl.remove();
  };
}
