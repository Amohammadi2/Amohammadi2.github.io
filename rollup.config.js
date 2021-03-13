import scss from "rollup-plugin-scss";
import serve from "rollup-plugin-serve";

const main_entry = "./src/app.js";
const build_dir = "./public/build/";

export default [
  {
    input: main_entry,
    output: {
      file: build_dir + "app-bundle.js",
      format: "iife"
    },

    plugins: [
      scss({
        output: build_dir + "app-bundle.scss"
      }),
      serve({
        contentBase: "public",
        port: 5500
      })
    ]
  }
];