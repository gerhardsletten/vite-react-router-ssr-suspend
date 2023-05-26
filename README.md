# Vite with React Router 6 + SSR + Suspend + React query example

- ViteJS powered
- SSR with lazy routes and React Query without "React router data routes" (save 30kb / 10kb gzip)
- Optional Preact in production for aditional reduces bundle size

## Prior art

Usage

`npm install` and `npm run dev` to run in dev or `npm run build && npm start` to run in production.

Site is running on [localhost:3000/](http://localhost:3000/)

## Prior art

### React router data apis and loaders

In React routers 6.4 Data Apis you can define lazy routes, but if you already are using React Query for data fetching RR's `loader` feels like a duplication. Also the `loader` / `action` are a very "remix-way" to organise your application, so it might not suite all. Data Apis also comes at the price of 30kb/10kb gzip extra bundle size compared to a basic React router solutin with `BrowserRouter` and `StaticRouter`.

### React 18 and lazy / Suspend

React 18 claim that you can use Suspend on the server, but this will require you to use `renderToPipeableStream` and to stream the whole html document, which is not compatible to using Vite, since it will need to control the entry point for JS and CSS through is index.html template.

In detail `renderToPipeableStream` works by sending the html for your application in pieces, when they are ready, patching the html-document by hidding and injecting parts in the allready delivered html document. This will not work if you plan to use preact in production.

## The solution

In this solution we use React routes `BrowserRouter` and `StaticRouter` and keep a shared route definition as jsx. But instead of React's buildin `lazy`, we use the [react-lazy-with-preload](https://www.npmjs.com/package/react-lazy-with-preload) which adds a `preload` promise for the lazy route.

```jsx
import React from "react";
import { Route } from "react-router-dom";
import { lazyWithPreload as lazy } from "react-lazy-with-preload";
import Layout from "./containers/Layout/Layout";

const HomePage = lazy(() => import("./containers/HomePage/HomePage"));
const AboutPage = lazy(() => import("./containers/AboutPage/AboutPage"));
const NotFound = lazy(() => import("./containers/NotFound/NotFound"));

export const routes = (
  <Route path="/" Component={Layout}>
    <Route index Component={HomePage} />
    <Route path={routeConfig.about} Component={AboutPage} />
    <Route path="*" Component={NotFound} />
  </Route>
);
```

With React routers `matchRoutes` we can then extract the inital route-tree to display

```jsx
const currentRouteTree = matchRoutes(
  createRoutesFromElements(routes),
  pathname
);
```

Then we can run a promise to preload the route components and call our own `ssrPrefetch` function that will load data needed:

```tsx
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
```

And example of an `ssrPrefetch` function that will prefetch data for the component:

```tsx
HomePage.ssrPrefetch = async ({ queryClient }) => {
  await Promise.all([
    queryClient.prefetchQuery(["homepage"], () => loadHomePage()),
  ]);
};
```

We can then use `renderToString` to render the complete inital route and send it to the client.

Client-side we will also use a promise to preload the component to avoid a Suspend-spinner:

```tsx
await Promise.all(
  currentRouteTree.map(async ({ route }) => {
    if (route.Component && "preload" in route.Component) {
      const lazyComp = route.Component as PreloadableComponent<any>;
      await lazyComp.preload();
    }
  })
);
```

But data for react query is passed as a serialized variable which we hydrate React Query's `queryClient` with.

```tsx
<Hydrate state={window.__REACT_QUERY_INITIAL_QUERIES__}>
  <HeadProvider headTags={headTags}>{children}</HeadProvider>
</Hydrate>
```
