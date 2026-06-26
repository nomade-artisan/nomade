// app/page.tsx
import HomeClient from "./HomeClient";
export const revalidate = 60
export default function Home() {
  return <HomeClient />;
}