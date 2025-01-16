import { esbuildPlugin } from "@web/dev-server-esbuild";

export default {
  browserStartTimeout: 90000,
  nodeResolve: true,
  plugins: [esbuildPlugin({ ts: true, target: "auto" })],
};
