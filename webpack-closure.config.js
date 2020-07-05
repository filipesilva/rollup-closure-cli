const path = require('path');
const { ContextReplacementPlugin } = require('webpack');
const TerserPlugin = require('terser-webpack-plugin');
const { BuildOptimizerWebpackPlugin } = require('@angular-devkit/build-optimizer');
const {
  GLOBAL_DEFS_FOR_TERSER,
  GLOBAL_DEFS_FOR_TERSER_WITH_AOT
} = require('@angular/compiler-cli');
const {
  AngularCompilerPlugin,
  AngularCompilerPluginOptions,
  NgToolsLoader,
  PLATFORM
} = require('@ngtools/webpack');
const ClosurePlugin = require('closure-webpack-plugin');

const cliTerserConfig = {
  safari10: true,
  output: {
    ascii_only: true,
    comments: false,
    webkit: true,
  },
  compress: {
    pure_getters: true,
    passes: 3,
    global_defs: {
      ...GLOBAL_DEFS_FOR_TERSER,
      ...GLOBAL_DEFS_FOR_TERSER_WITH_AOT,
    },
  },
}

module.exports = {
  mode: "production",
  entry: './src/main.ts',
  output: {
    path: path.resolve(__dirname, 'dist-webpack-closure'),
  },
  node: false,
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: ["@angular-devkit/build-optimizer/webpack-loader", '@ngtools/webpack']
      },
      {
        test: /\.js$/,
        use: "@angular-devkit/build-optimizer/webpack-loader"

      },
      {
        // Mark files inside `@angular/core` as using SystemJS style dynamic imports.
        // Removing this will cause deprecation warnings to appear.
        test: /[\/\\]@angular[\/\\]core[\/\\].+\.js$/,
        parser: { system: true },
      },
    ]
  },
  plugins: [
    new AngularCompilerPlugin({
      tsConfigPath: './tsconfig.app.json',
      mainPath: path.resolve(__dirname, './src/main.ts'),
      directTemplateLoading: true,
      emitClassMetadata: false,
      emitNgModuleScope: false,
    }),
    new BuildOptimizerWebpackPlugin(),
    // Always replace the context for the System.import in angular/core to prevent warnings.
    // https://github.com/angular/angular/issues/11580
    // With VE the correct context is added in @ngtools/webpack, but Ivy doesn't need it at all.
    new ContextReplacementPlugin(/\@angular(\\|\/)core(\\|\/)/),
  ],
  optimization: {
    minimizer: [
      new ClosurePlugin({ mode: 'STANDARD' }, {languageOut: 'ECMASCRIPT_2015'}),
      new TerserPlugin({ terserOptions: cliTerserConfig }),
    ],
  },
};

// Notes:
// - Fails on windows due to https://github.com/webpack-contrib/closure-webpack-plugin/issues/100
//   ERROR in closure-compiler: java.nio.file.InvalidPathException: Illegal char <:> at index 114: D:\sandbox\rollup-closure-cli\node_modules\@angular-devkit\build-optimizer\src\build-optimizer\webpack-loader.js!D:\sandbox\rollup-closure-cli\node_modules\rxjs\_esm5\internal\observable\merge.js
//         at sun.nio.fs.WindowsPathParser.normalize(WindowsPathParser.java:182)
// - if that loader if removed, fails with
//   ERROR in closure-compiler: java.nio.file.InvalidPathException: Illegal char <:> at index 70: D:\sandbox\rollup-closure-cli\$$_lazy_route_resource lazy groupOptions: {} namespace object
// - using TerserPlugin before ClosurePlugin shows several warnings and one error
//   This code cannot be converted from ES6. class expression that cannot be extracted
// - running in linux has no errors but makes a larger bundle (218k -> 326k)
// - using `mode: 'AGGRESSIVE_BUNDLE'` instead of `mode: 'STANDARD'` yields 2 errors:
//   RuntimeTemplate.moduleId(): Module /mnt/d/sandbox/rollup-closure-cli/node_modules/@angular-devkit/build-optimizer/src/build-optimizer/webpack-loader.js!/mnt/d/sandbox/rollup-closure-cli/node_modules/rxjs/_esm5/internal/util/toSubscriber.js has no id. This should not happen.
//   RuntimeTemplate.moduleId(): Module /mnt/d/sandbox/rollup-closure-cli/node_modules/@angular-devkit/build-optimizer/src/build-optimizer/webpack-loader.js!/mnt/d/sandbox/rollup-closure-cli/src/app/lazy/lazy.component.js has no id. This should not happen.
