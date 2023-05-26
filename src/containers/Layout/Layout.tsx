import React, { Suspense } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { ErrorBoundary } from "react-error-boundary";
import { QueryErrorResetBoundary } from "@tanstack/react-query";
import type { SsrPrefetchComponent } from "../../types/ssr-prefetch-type";

import useLayout, { load as loadLayout } from "./useLayout";
import classNames from "classnames";

const Layout: SsrPrefetchComponent = () => {
  const { data } = useLayout();
  return (
    <>
      <header className="content-wrapper">
        <div className="flex items-center justify-between py-4">
          <Link to="/" className="font-bold">
            {data?.title}
          </Link>
          <nav className="flex items-center gap-4">
            {data?.meny.map(({ to, title }, i) => (
              <NavLink
                key={i}
                to={to}
                className={({ isActive }) =>
                  classNames("hover:underline", {
                    underline: isActive,
                  })
                }
              >
                {title}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="content-wrapper">
        <QueryErrorResetBoundary>
          {({ reset }) => (
            <ErrorBoundary
              fallbackRender={({ error, resetErrorBoundary }) => (
                <div>
                  There was an error!{" "}
                  <button onClick={() => resetErrorBoundary()}>
                    Try again
                  </button>
                  <pre className=" whitespace-normal">{error.message}</pre>
                </div>
              )}
              onReset={reset}
            >
              <Suspense fallback={<Loading />}>
                <Outlet />
              </Suspense>
            </ErrorBoundary>
          )}
        </QueryErrorResetBoundary>
      </main>
      <footer className="sticky top-[100vh] content-wrapper py-4 text-center">
        {data?.footer}
      </footer>
    </>
  );
};

Layout.ssrPrefetch = async ({ queryClient }) => {
  await Promise.all([
    queryClient.prefetchQuery(["layout"], () => loadLayout()),
  ]);
};

function Loading() {
  return (
    <div className="flex min-h-[92vh] items-center justify-center">
      <div className="relative h-[1em] w-[1em] text-4xl">
        <div className="absolutes top-1/2 left-1/2 w-full h-full rounded-full border-[0.1em] border-transparent border-t-slate-800 animate-spin origin-center" />
      </div>
    </div>
  );
}

export default Layout;
