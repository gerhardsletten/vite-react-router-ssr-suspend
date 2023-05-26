import React from "react";
import useHomePage, { load as loadHomePage } from "./useHomePage";
import type { SsrPrefetchComponent } from "../../types/ssr-prefetch-type";
import PageWrapper from "../../components/PageWrapper";

const HomePage: SsrPrefetchComponent = () => {
  const { data } = useHomePage();
  return (
    <PageWrapper title={data?.title}>
      <h1 className="h1">{data?.title}</h1>
      <p>{data?.message}</p>
    </PageWrapper>
  );
};

HomePage.ssrPrefetch = async ({ queryClient }) => {
  await Promise.all([
    queryClient.prefetchQuery(["homepage"], () => loadHomePage()),
  ]);
};

export default HomePage;
