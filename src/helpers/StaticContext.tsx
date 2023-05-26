import React, { createContext } from "react";
import type { FC, ReactNode } from "react";

export interface TStaticContext {
  statusCode?: number;
}

export const StaticContext = createContext<null | TStaticContext>(null);

type Props = {
  children: ReactNode;
  staticContext: TStaticContext;
};

function StaticContextProvider({ children, staticContext }: Props) {
  return (
    <StaticContext.Provider value={staticContext}>
      {children}
    </StaticContext.Provider>
  );
}

export default StaticContextProvider;
