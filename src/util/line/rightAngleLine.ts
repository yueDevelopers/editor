import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";

// 直线合并中间无用折点
export const mergeRightAngleLinePoint = (
  points: { x: number; y: number }[]
) => {
  const range = 15;
  // 先合并首尾
  if (
    Math.abs(points[0].x - points[1].x) < range &&
    Math.abs(points[0].y - points[1].y) < range
  ) {
    points.splice(0, 1);
  }
  const lastIndex = points.length - 1;
  if (
    Math.abs(points[lastIndex].x - points[lastIndex - 1].x) < range &&
    Math.abs(points[lastIndex].y - points[lastIndex - 1].y) < range
  ) {
    points.splice(lastIndex, 1);
  }
  // 合并中间节点
  for (let i = 1; i < points.length - 1; i++) {
    const prev = points[i - 1];
    const now = points[i];
    const next = points[i + 1];
    if (Math.abs(prev.x - now.x) < range && Math.abs(now.x - next.x) < range) {
      prev.x = now.x;
      points.splice(i--, 1);
    } else if (
      Math.abs(prev.y - now.y) < range &&
      Math.abs(now.y - next.y) < range
    ) {
      prev.y = now.y;
      points.splice(i--, 1);
    }
  }
  return points;
};

// 直线首末点赋值并修改相邻点坐标保持直角
export const setRightAngleLineBeginOrEnd = (
  points: { x: number; y: number }[],
  index: number,
  target: { x: number; y: number }
) => {
  let now;
  if (index === 0) {
    now = points[0];
    const next = points[1];
    let direction;
    // 横线
    if (now.y === next.y) {
      direction = "horizontal";
      // 竖线
    } else if (now.x === next.x) {
      direction = "vertical";
    }
    // 如果直线加点
    if (points.length === 2) {
      points.splice(0, 0, { x: target.x, y: target.y });
      // 调整临点保持垂直
      if (direction === "horizontal") {
        now.x = target.x;
      } else if (direction === "vertical") {
        now.y = target.y;
      }
      mergeRightAngleLinePoint(points);
    } else {
      // 调整临点保持垂直
      if (direction === "horizontal") {
        next.y = target.y;
      } else if (direction === "vertical") {
        next.x = target.x;
      }
      now.x = target.x;
      now.y = target.y;
    }
  } else {
    // 修正加点问题
    index = points.length - 1;
    now = points[index];
    const prev = points[index - 1];
    let direction;
    // 横线
    if (now.y === prev.y) {
      direction = "horizontal";
      // 竖线
    } else if (now.x === prev.x) {
      direction = "vertical";
    }
    // 如果直线加点
    if (points.length === 2) {
      points.push({ x: target.x, y: target.y });
      // 调整临点保持垂直
      if (direction === "horizontal") {
        now.x = target.x;
      } else if (direction === "vertical") {
        now.y = target.y;
      }
      mergeRightAngleLinePoint(points);
    } else {
      // 调整临点保持垂直
      if (direction === "horizontal") {
        prev.y = target.y;
      } else if (direction === "vertical") {
        prev.x = target.x;
      }
      now.x = target.x;
      now.y = target.y;
    }
  }
  return points;
};
// 根据两点返回折线坐标
export const getLinePoints = (
  pointA: { x: number; y: number },
  pointB: { x: number; y: number }
) => {
  const arr = [pointA];
  // if (Math.abs(pointB.x - pointA.x) >= Math.abs(pointB.y - pointA.y)) {
  //   // X轴距离大,三折线
  //   const point1 = { x: (pointA.x + pointB.x) / 2, y: pointA.y };
  //   const point2 = { x: (pointA.x + pointB.x) / 2, y: pointB.y };
  //   arr.push(point1, point2);
  // } else {
  // const point1 = { y: (pointA.y + pointB.y) / 2, x: pointA.x };
  // const point2 = { y: (pointA.y + pointB.y) / 2, x: pointB.x };
  // arr.push(point1, point2);
  // Y轴距离大,二折线
  const point1 = { x: pointA.x, y: pointB.y };
  arr.push(point1);
  // }
  arr.push(pointB);
  return arr;
};
