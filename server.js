import fsp from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import express from 'express'
import serialize from 'serialize-javascript'
import fetch from 'isomorphic-unfetch'

global.fetch = fetch

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const isTest = process.env.VITEST

async function createServer(
  root = process.cwd(),
  isProduction = process.env.NODE_ENV === "production",
  hmrPort
) {
  const resolve = (p) => path.resolve(__dirname, p)
  let app = express();
  /**
   * @type {import('vite').ViteDevServer}
   */
  let vite;

  if (!isProduction) {
    vite = await (
      await import('vite')
    ).createServer({
      root,
      logLevel: isTest ? 'error' : 'info',
      server: {
        middlewareMode: true,
        watch: {
          usePolling: true,
          interval: 100,
        },
        hmr: {
          port: hmrPort,
        },
      },
      appType: 'custom',
    });

    app.use(vite.middlewares);
  } else {
    app.use((await import('compression')).default())
    app.use(express.static(resolve("dist/client"), {
      index: false,
    }));
  }

  app.use("*", async (req, res) => {
    let url = req.originalUrl;

    try {
      let template;
      /**
       * @type {import('./src/entry.server').render}
       */
      let render;

      if (!isProduction) {
        template = await fsp.readFile(resolve("index.html"), "utf8");
        template = await vite.transformIndexHtml(url, template);
        render = await vite
          .ssrLoadModule("src/entry.server.tsx")
          .then((m) => m.render);
      } else {
        template = await fsp.readFile(
          resolve("dist/client/index.html"),
          "utf8"
        );
        render = (await import('./dist/server/entry.server.js')).render
      }
      const {
        html: appHtml,
        context,
        headTags,
        state,
      } = await render(url)
      // Todo: StaticRouter does not support redirects
      if (context.url) {
        return res.redirect(context.url)
      }
      const html = template
        .replace(`<!--app-html-->`, appHtml)
        .replace(`<!--app-head-->`, '')
        .replace(`<!--app-title-->`, headTags)
        .replace(
          `<!--app-scripts-->`,
          `<script>window.__REACT_QUERY_INITIAL_QUERIES__=${serialize(
            state
          )}</script>`
        );
      const status = context.statusCode || 200
      res.setHeader("Content-Type", "text/html");
      return res.status(status).end(html);
    } catch (error) {
      if (!isProduction) {
        vite.ssrFixStacktrace(error);
      }
      console.log(error.stack);
      res.status(500).end(error.stack);
    }
  });

  return app;
}
const port = process.env.SSR_PORT || 3000
createServer().then((app) => {
  app.listen(port, () => {
    console.log(`> Started on port ${port}`);
  });
});
