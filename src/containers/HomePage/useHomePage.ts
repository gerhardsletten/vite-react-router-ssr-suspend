import { useQuery } from "@tanstack/react-query";
import { sleep } from "../../helpers/utils";

export interface HomePageData {
  title: string;
  message: string;
}

export async function load(): Promise<HomePageData> {
  await sleep(100);
  return {
    title: "Homepage",
    message: "Message from homepage",
  };
}

function useHomePage() {
  return useQuery(["homepage"], () => load());
}

export default useHomePage;
