import React from "react";
import useHomePage, { load as loadAboutPage } from "./useAboutPage";
import type { SsrPrefetchComponent } from "../../types/ssr-prefetch-type";
import PageWrapper from "../../components/PageWrapper";

const AboutPage: SsrPrefetchComponent = () => {
  const { data } = useHomePage();
  const actionError = () => {
    throw new Error("An error");
  };
  return (
    <PageWrapper title={data?.title}>
      <h1 className="h1">{data?.title}</h1>
      <p>{data?.message}</p>
      <button onClick={actionError}>Trigger an error</button>
    </PageWrapper>
  );
};

AboutPage.ssrPrefetch = async ({ queryClient }) => {
  await Promise.all([
    queryClient.prefetchQuery(["about"], () => loadAboutPage()),
  ]);
};

export default AboutPage;
