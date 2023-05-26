import { useQuery } from "@tanstack/react-query";
import { sleep } from "../../helpers/utils";

export interface AboutPageData {
  title: string;
  message: string;
}

export async function load(): Promise<AboutPageData> {
  await sleep(100);
  // throw new Error("an error");
  return {
    title: "AboutPage",
    message: "Message from AboutPage",
  };
}

function useAboutPage() {
  return useQuery(["about"], () => load());
}

export default useAboutPage;
