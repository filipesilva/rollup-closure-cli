import path from "path";
import nodeResolve from '@rollup/plugin-node-resolve';
import buildOptimizer from '@angular-devkit/build-optimizer/src/build-optimizer/rollup-plugin.js';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import inject from '@rollup/plugin-inject';
import replace from '@rollup/plugin-replace';

const closureConfig = {
  charset: 'UTF-8',
  // Uncomment to se more information.
  // warning_level: 'VERBOSE',
  // language_out: 'ECMASCRIPT_2015',
  // Angular code contains a lot of non-standard JSDoc tags, like @publicApi.
  // These warnings won't appear anyway unless you set warning_level to verbose.
  jscomp_off: ['nonStandardJsDocs'],

  // Uncomment to attempt advanced optimizations.
  // compilation_level: 'ADVANCED',
  // Angular uses 'System', which needs an extern in advanced mode.
  externs: ['./externs.js'],
};

export default {
  input: './out-tsc/app/main-rollup.js',
  output: {
    dir: './dist-rollup-closure/',
    format: 'esm',
    sourcemap: true,
  },
  preserveEntrySignatures: false,
  treeshake: true,
  plugins: [
    nodeResolve({ mainFields: ['es2015', 'browser', 'module', 'main'] }),
    inject({
      ngDevMode: [path.resolve('./angular-build-constants.js'), 'ngDevMode'],
      ngJitMode: [path.resolve('./angular-build-constants.js'), 'ngJitMode'],
      ngI18nClosureMode: [path.resolve('./angular-build-constants.js'), 'ngI18nClosureMode']
    }),
    // workaround JSC_BLOCK_SCOPED_DECL_MULTIPLY_DECLARED_ERROR closure buggy isolation of variables
    // declared in ES Modules https://github.com/ampproject/rollup-plugin-closure-compiler/issues/92
    replace({
      Console: 'Console_',
      Location: 'Location_',
    }),
    buildOptimizer({
      sideEffectFreeModules: [
        `node_modules/@angular/core/`,
        `node_modules/@angular/platform-browser/`,
        `node_modules/@angular/common/`,
        `node_modules/@angular/compiler/`,
        `node_modules/@angular/router/`,
        `node_modules/rxjs/`,
      ]
    }),
    compiler(closureConfig)
  ]
};
