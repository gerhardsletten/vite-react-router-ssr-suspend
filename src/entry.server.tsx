import React, { Fragment } from "react";
import ReactDOMServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import {
  Routes,
  matchRoutes,
  createRoutesFromElements,
} from "react-router-dom";
import { QueryClient, dehydrate } from "@tanstack/react-query";
import Root from "./Root";
import { routes } from "./routes";

import type { PreloadableComponent } from "react-lazy-with-preload";
import type {
  SsrPrefetchComponent,
  SsrPrefetchFn,
} from "./types/ssr-prefetch-type";

export async function render(url: string) {
  const location = new URL(url, "http://localhost:3000");
  const { pathname } = location;
  let headTags: React.ReactElement<unknown>[] = [];
  const staticContext = { statusCode: 200 };
  const queryClient = new QueryClient();
  const currentRouteTree = matchRoutes(
    createRoutesFromElements(routes),
    pathname
  );
  if (currentRouteTree) {
    await Promise.all(
      currentRouteTree.map(async ({ route, params }) => {
        let ssrPrefetch: SsrPrefetchFn | null = null;
        if (route.Component && "preload" in route.Component) {
          const lazyComp = route.Component as PreloadableComponent<any>;
          const loadedComp = await lazyComp.preload();
          if (loadedComp.ssrPrefetch) {
            ssrPrefetch = (loadedComp as SsrPrefetchComponent).ssrPrefetch;
          }
        } else if (route.Component && "ssrPrefetch" in route.Component) {
          const prefetchComp = route.Component as SsrPrefetchComponent;
          ssrPrefetch = prefetchComp.ssrPrefetch;
        }
        if (ssrPrefetch !== null) {
          await ssrPrefetch({ location, queryClient, params });
        }
      })
    );
  }
  const dehydratedState = dehydrate(queryClient);
  const component = (
    <React.StrictMode>
      <Root
        queryClient={queryClient}
        dehydratedState={dehydratedState}
        headTags={headTags}
        staticContext={staticContext}
      >
        <StaticRouter location={url}>
          <Routes>{routes}</Routes>
        </StaticRouter>
      </Root>
    </React.StrictMode>
  );
  const html = ReactDOMServer.renderToString(component);
  queryClient.clear();
  const headTagsRendered = ReactDOMServer.renderToString(
    <>
      {headTags.map((el, i) => (
        <Fragment key={i}>{el}</Fragment>
      ))}
    </>
  );
  return {
    html,
    context: staticContext,
    headTags: headTagsRendered,
    state: dehydratedState,
  };
}
