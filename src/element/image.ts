import { BELT, changeBeltState, changeState } from "@/component";
import { getCustomAttrs, setCustomAttrs } from "@/util/customAttr";
import Konva from "konva";
import _ from "lodash";
import { UUID } from "src/util/uuid";
import "../assets/gifler.js";
import INLEDITOR from "@/index.js";

// const cacheImgList: Record<string, Konva.Image> = {};
export const createImage: (
  img: string,
  layer?: Konva.Layer
) => Promise<Konva.Image> = (img, layer?: Konva.Layer) => {
  if (!img || img === "null") {
    img = "/micro-assets/platform-web/close.png";
  }
  console.log("加载新图片");
  // if (cacheImgList[img]) {
  //   const image = cacheImgList[img].clone();
  //   image.setId(UUID());
  //   return Promise.resolve(image);
  // }
  return new Promise<Konva.Image>((res, rej) => {
    if (img.indexOf(".gif") >= 0) {
      const canvas = document.createElement("canvas");
      // use external library to parse and draw gif animation
      function onDrawFrame(ctx, frame) {
        if (!layer.attrs.stopGif && image.attrs.runGif) {
          // update canvas size
          canvas.width = frame.width;
          canvas.height = frame.height;
          // update canvas that we are using for Konva.Image
          ctx.drawImage(frame.buffer, 0, 0);
          // redraw the layer
          layer?.draw();
        }
      }

      (window as any).gifler(img).frames(canvas, onDrawFrame);
      const image = new Konva.Image({
        runGif: true,
        image: canvas,
        name: "thingImage",
        id: UUID(),
      });
      res(image);
    } else {
      Konva.Image.fromURL(
        img,
        (darthNode: Konva.Image) => {
          const { width, height } = darthNode.attrs.image;
          darthNode.setAttrs({
            myWidth: width,
            myHeight: height,
            src: img,
            name: "thingImage",
            id: UUID(),
          });
          // darthNode.cache();
          // cacheImgList[img] = darthNode;
          res(darthNode);
        },
        (err: Event) => {
          img = "/micro-assets/platform-web/close.png";
          Konva.Image.fromURL(img, (darthNode: Konva.Image) => {
            const { width, height } = darthNode.attrs.image;
            darthNode.setAttrs({
              myWidth: width,
              myHeight: height,
              src: img,
              name: "thingImage",
              id: UUID(),
            });
            res(darthNode);
          });
        }
      );
    }
  });
};
export const changeImgState = (thingImage: Konva.Node) => {
  thingImage.cache();
  thingImage.filters([Konva.Filters.RGB]);
  thingImage.red(198);
  thingImage.green(216);
  thingImage.blue(174);
};
export const changeThingComponentState = (
  stage: Konva.Stage,
  node: Konva.Image,
  state: string | number
) => {
  const { thing } = getCustomAttrs(node.parent);
  const { componentName } = node.getAttrs();

  if (componentName && componentName === "BELT") {
    // const belt = new BELT(stage, { thingInfo: thing });
    // belt.render(state as number);
    changeBeltState(stage, state, thing.iu);
  }
  if (componentName && componentName === "Scraper") {
    // const belt = new BELT(stage, { thingInfo: thing });
    // belt.render(state as number);
    changeState(stage, state, thing.iu);
  }
  stage.batchDraw();
};

export const changeThingImage = async (
  imageNode: Konva.Image,
  src: string,
  ie: INLEDITOR
) => {
  const parent = imageNode.parent;
  const old = ie.cacheImgArr.find(
    (ele) => ele.parentId === parent.id() && ele.src === src
  );
  if (old) {
    old.img.setAttrs({ visible: true, runGif: true });
  } else {
    const newImage = await createImage(src, ie.thingLayer);
    newImage.getAttrs().image.src = src;
    const data = _.cloneDeep(imageNode.getAttrs());
    delete data.image;
    newImage.setAttrs(data);
    ie.cacheImgArr.push({ parentId: parent.id(), src, img: newImage });
    parent?.add(newImage);
  }
  imageNode.setAttrs({ visible: false, runGif: false });
};
