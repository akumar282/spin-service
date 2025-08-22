import type { Route } from "./+types/landing";
import { Welcome } from '~/modules/welcome/welcome';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Landing() {
  return <Welcome />;
}
