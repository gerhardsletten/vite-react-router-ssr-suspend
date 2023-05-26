import React from "react";
import { HeadProvider, Title, Link, Meta } from "react-head";

type Props = {
  children: React.ReactNode;
  title?: string;
};

function PageWrapper({ children, title }: Props) {
  return (
    <>
      {title && <Title>{title}</Title>}
      {children}
    </>
  );
}

export default PageWrapper;
