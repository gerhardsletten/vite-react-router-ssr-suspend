import type { QueryClient } from "@tanstack/react-query";
import type { Params } from "react-router-dom";

export type SsrPrefetchFn = (args: {
  location: URL;
  queryClient: QueryClient;
  params: Params;
}) => Promise<void>;

export interface SsrPrefetchComponent extends React.FC {
  ssrPrefetch: SsrPrefetchFn;
}
