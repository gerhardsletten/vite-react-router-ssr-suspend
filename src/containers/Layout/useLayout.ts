import { useQuery } from "@tanstack/react-query";
import { sleep } from "../../helpers/utils";
import { routeConfig } from "../../routeConfig";

export interface Menu {
  title: string;
  to: string;
}

export interface LayoutData {
  title: string;
  footer: string;
  meny: Menu[];
}

export async function load(): Promise<LayoutData> {
  await sleep(100);
  return {
    title: "Vite+ReactRouter+Lazy+SSR",
    footer: "This is a footer",
    meny: [
      {
        title: "Home",
        to: routeConfig.home,
      },
      {
        title: "About",
        to: routeConfig.about,
      },
      {
        title: "Nothing Here",
        to: "/nothing-here",
      },
    ],
  };
}

function useLayout() {
  return useQuery(["layout"], () => load());
}

export default useLayout;
