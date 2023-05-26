import React, { useContext } from "react";
import { useLocation } from "react-router-dom";
import { StaticContext } from "../../helpers/StaticContext";
import PageWrapper from "../../components/PageWrapper";

function NotFound() {
  const { pathname } = useLocation();
  const staticContext = useContext(StaticContext);
  if (import.meta.env.SSR && staticContext) {
    staticContext.statusCode = 400;
  }
  const title = "404 page not found";
  return (
    <PageWrapper title={title}>
      <h1 className="h1">{title}</h1>
      <p>
        The page <strong>"{pathname}"</strong> was not found
      </p>
    </PageWrapper>
  );
}

export default NotFound;
