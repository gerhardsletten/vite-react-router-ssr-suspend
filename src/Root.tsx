import React from "react";
import { HeadProvider } from "react-head";
import {
  QueryClientProvider,
  Hydrate,
  QueryClient,
} from "@tanstack/react-query";
import StaticContextProvider, {
  type TStaticContext,
} from "./helpers/StaticContext";

type Props = {
  children: React.ReactNode;
  queryClient: QueryClient;
  dehydratedState: unknown;
  headTags?: React.ReactElement<unknown>[];
  staticContext: TStaticContext;
};

function Root({
  queryClient,
  dehydratedState,
  headTags,
  children,
  staticContext,
}: Props) {
  return (
    <StaticContextProvider staticContext={staticContext}>
      <QueryClientProvider client={queryClient}>
        <Hydrate state={dehydratedState}>
          <HeadProvider headTags={headTags}>{children}</HeadProvider>
        </Hydrate>
      </QueryClientProvider>
    </StaticContextProvider>
  );
}

export default Root;
