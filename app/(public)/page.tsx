import HomeClient from "./HomeClient";
import { getCollections } from "@/lib/collections/queries";
export const revalidate = 60

export default async function Home() {
  const collections = await getCollections();
  return <HomeClient collections={collections} />;
}