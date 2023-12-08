import Konva from "konva";
import { isEqual, uniqWith } from "lodash";
import { getCustomAttrs, getLineInfo } from "./customAttr";

// 获取参数B在此继承线的孩子
export const getAncestorSon = (child: Konva.Node, parent: Konva.Node) => {
  if (!child.parent) {
    return false;
  }
  if (child.parent === parent) {
    return child;
  } else {
    return getAncestorSon(child.parent, parent);
  }
};

const findParents = (pid: string, stage) => {
  const arr = [];
  const node = stage.findOne("#" + pid);
  if (node?.hasName("thingImage")) {
    arr.push(node);
  } else {
    const lineInfo = getLineInfo(node);
    lineInfo.inLineIds.map((id) => {
      const line = stage.findOne("#" + id);
      const lineInfo = getLineInfo(line);
      arr.push(...findParents(lineInfo.from, stage));
    });
  }
  return arr;
};
const findChildren = (pid: string, stage) => {
  const arr = [];
  const node = stage.findOne("#" + pid);
  if (node?.hasName("thingImage")) {
    arr.push(node);
  } else {
    const lineInfo = getLineInfo(node);
    lineInfo?.outLineIds.map((id) => {
      const line = stage.findOne("#" + id);
      const lineInfo = getLineInfo(line);
      arr.push(...findParents(lineInfo.to, stage));
    });
  }
  return arr;
};

export const getRelations = (stage: Konva.Stage) => {
  const arr = [];
  stage.find("Arrow").forEach((line: any) => {
    arr.push(...getRelation(line, stage));
  });
  return uniqWith(arr, isEqual);
};

export const getRelation = (line, stage: Konva.Stage) => {
  const lineInfo = getLineInfo(line);
  const parents = findParents(lineInfo.from, stage);
  const children = findChildren(lineInfo.to, stage);
  let res = [];
  parents.forEach((p) => {
    children.forEach((c) => {
      res.push({
        instanceIdUp: p.parent.id(),
        instanceIdDown: c.parent.id(),
      });
    });
  });
  res = uniqWith(res, isEqual);
  return res;
};
