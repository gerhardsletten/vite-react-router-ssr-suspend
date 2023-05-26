import * as React from "react";
import ReactDOM from "react-dom/client";
import {
  BrowserRouter,
  Routes,
  matchRoutes,
  createRoutesFromElements,
} from "react-router-dom";
import { QueryClient } from "@tanstack/react-query";
import Root from "./Root";
import { routes } from "./routes";

import type { PreloadableComponent } from "react-lazy-with-preload";

declare global {
  var __REACT_QUERY_INITIAL_QUERIES__: unknown;
}

const logger = () => {};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      retry: 0,
      suspense: true,
    },
  },
  logger: { error: logger, log: logger, warn: logger },
});

const container = document.getElementById("app")!;
const dehydratedState = window.__REACT_QUERY_INITIAL_QUERIES__;

async function render() {
  const currentRouteTree = matchRoutes(
    createRoutesFromElements(routes),
    window.location
  );
  if (currentRouteTree) {
    await Promise.all(
      currentRouteTree.map(async ({ route }) => {
        if (route.Component && "preload" in route.Component) {
          const lazyComp = route.Component as PreloadableComponent<any>;
          await lazyComp.preload();
        }
      })
    );
  }

  ReactDOM.hydrateRoot(
    container,
    <React.StrictMode>
      <Root
        queryClient={queryClient}
        dehydratedState={dehydratedState}
        staticContext={{ statusCode: 200 }}
      >
        <BrowserRouter>
          <Routes>{routes}</Routes>
        </BrowserRouter>
      </Root>
    </React.StrictMode>
  );
}

render();
