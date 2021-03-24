const { override, fixBabelImports, addBabelPlugin, addWebpackAlias } = require('customize-cra');
const ModuleScopePlugin = require("react-dev-utils/ModuleScopePlugin");
const path = require("path");
const fs = require('fs');

const pathAliases = {
    '@assets': path.resolve(__dirname, "../assets"),
    '@modules': path.resolve(__dirname, "../modules")
};

const targetOverride = config => {
    config.target = 'electron-renderer';
    return config;
};

const ModuleScopeExceptionOverride = config => {
    config.resolve.plugins.forEach(plugin => {
        if (plugin instanceof ModuleScopePlugin) {
            Object.values(pathAliases).forEach(folder => 
                fs.readdirSync(folder)
                    .forEach(file =>
                        plugin.allowedFiles.add(
                            path.resolve(folder, file)))
            );
        }
    });
    return config;
};

module.exports = {
    paths: (paths, _) => {
        paths.appSrc = path.resolve(__dirname, '../renderer');
        paths.appIndexJs = path.resolve(__dirname, '../renderer/index.js');
        return paths
    },
    webpack: override(
        addWebpackAlias(pathAliases),
        ModuleScopeExceptionOverride,
        targetOverride,
        fixBabelImports('import',
            {
                libraryName: 'antd',
                libraryDirectory: 'es',
                style: 'css'
            }),
        addBabelPlugin('@babel/plugin-transform-modules-commonjs')
    )
};