import React from "react";
import { Route } from "react-router-dom";
import { lazyWithPreload as lazy } from "react-lazy-with-preload";

import Layout from "./containers/Layout/Layout";

const HomePage = lazy(() => import("./containers/HomePage/HomePage"));
const AboutPage = lazy(() => import("./containers/AboutPage/AboutPage"));
const NotFound = lazy(() => import("./containers/NotFound/NotFound"));

import { routeConfig } from "./routeConfig";

export const routes = (
  <Route path="/" Component={Layout}>
    <Route index Component={HomePage} />
    <Route path={routeConfig.about} Component={AboutPage} />
    <Route path="*" Component={NotFound} />
  </Route>
);
