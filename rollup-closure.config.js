import nodeResolve from '@rollup/plugin-node-resolve';
import buildOptimizer from '@angular-devkit/build-optimizer/src/build-optimizer/rollup-plugin.js';
import compiler from '@ampproject/rollup-plugin-closure-compiler';
import { terser } from 'rollup-plugin-terser';
import { GLOBAL_DEFS_FOR_TERSER, GLOBAL_DEFS_FOR_TERSER_WITH_AOT } from '@angular/compiler-cli';

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

// Use terser only to add the global defines.
const globalDefTerserConfig = {
  mangle: false,
  compress: {
    defaults: false,
    global_defs: {
      ...GLOBAL_DEFS_FOR_TERSER,
      ...GLOBAL_DEFS_FOR_TERSER_WITH_AOT,
    },
  },
}


export default {
  input: './out-tsc/app/main-aot.js',
  output: {
    dir: './dist-rollup-closure/',
    format: 'esm',
    sourcemap: true,
  },
  preserveEntrySignatures: false,
  treeshake: true,
  plugins: [
    nodeResolve({ mainFields: ['es2015', 'browser', 'module', 'main'] }),
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
    terser(globalDefTerserConfig),
    compiler(closureConfig)
  ]
};
