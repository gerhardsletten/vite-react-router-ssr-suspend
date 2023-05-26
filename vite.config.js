import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import rollupReplace from "@rollup/plugin-replace";

// https://vitejs.dev/config/
export default defineConfig(async ({ command, mode, ssrBuild }) => {
  const isProducton = mode === 'production'
  const buildAlias =
    isProducton && !ssrBuild
      ? { react: 'preact/compat', 'react-dom': 'preact/compat' }
      : {}
  const analyze = Boolean(process.env.ANALYZE)
  const extraPlugins = analyze ? [(await import('rollup-plugin-visualizer')).visualizer({
    open: true,
    gzipSize: true,
    sourcemap: true,
    template: 'treemap'
  })] : []
  return {
    plugins: [
      rollupReplace({
        preventAssignment: true,
        values: {
          __DEV__: JSON.stringify(true),
          "process.env.NODE_ENV": JSON.stringify("development"),
        },
      }),
      react(),
      ...extraPlugins,
    ],
    ssr: {
      noExternal: ['react-error-boundary']
    },
    build: {
      sourcemap: analyze,
    },
    resolve: {
      alias: {
        ...buildAlias
      }
    }
  }
})
