import type { Route } from "./+types/home";
import { LoginComponent } from '~/modules/login/login';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Login() {
  return <LoginComponent />;
}
