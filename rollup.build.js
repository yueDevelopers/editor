import image from "@rollup/plugin-image";
import typescript from "@rollup/plugin-typescript";
import dts from "rollup-plugin-dts";
import { terser } from "rollup-plugin-terser";
import { entry } from "./entry.cjs";

const rollupConfig = [];
const externals = ["konva", "lodash"];
// 打包核心包文件
for (let i of entry) {
  const type = i.type === "main" ? "" : `${i.type}/`;
  rollupConfig.push({
    external: externals,
    input: i.root,
    output: [
      {
        file: `build/${type}index.js`,
        format: "es",
      },
    ],
    plugins: [typescript(), image(), terser()],
  });

  // 生成相关d.ts
  rollupConfig.push({
    input: i.root,
    external: externals,
    output: [
      {
        file: `build/${type}index.d.ts`,
        format: "es",
      },
    ],
    plugins: [dts()],
  });
}
export default rollupConfig;
