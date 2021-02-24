const { override, fixBabelImports } = require("customize-cra");

function targetOverride(config) {
  config.target = 'electron-renderer';
  return config;
}

module.exports = override(
  targetOverride,
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: "css"
  })
);