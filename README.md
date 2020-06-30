# rollup-closure-cli

Some experiments comparing setups using Angular CLI, Rollup with Terser, and Rollup with Closure.


## Running the code
```
# build everything and report sizes
yarn build-all
```

Alternatively pick and choose individual build stages:
```
# clean the dist dir
yarn clean

# build the Angular CLI build
yarn cli

# compile Angular templates with ngc outside of the CLI
yarn rollup-ngc

# build the rollup + terser build
yarn rollup-terser

# build the rollup + closure compiler build
yarn rollup-closure

# build the Angular CLI build with experimental rollup pass
yarn cli-rollup

# report the size results
yarn report
```


## Preliminary notes

The Rollup with Closure currently suffers from (at least) these issues:
  - `Console` and `Location` class/let definitions cause `JSC_BLOCK_SCOPED_DECL_MULTIPLY_DECLARED_ERROR` error (https://github.com/ampproject/rollup-plugin-closure-compiler/issues/92, workaround via `node patch-bo-to-make-var-iife.js`)
  - probably https://github.com/ampproject/rollup-plugin-closure-compiler/issues/93

Closure approaches would also need to define the same global defs are Terser. The GCC feature for it seems to be `--define` (https://github.com/google/closure-compiler/wiki/Flags-and-Options) but needs `@define` markers, which aren't there. We'd need to incorporate them somehow too. Currently using Terser in the Closure version just for the global defines.
