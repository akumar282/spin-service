import type { Route } from "./+types/landing";
import { Home } from '~/modules/home/home'

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Landing() {
  return <Home/>;
}
