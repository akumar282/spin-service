import type { Route } from "./+types/home";
import { SignUpComponent } from '~/modules/auth/signup';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function SignUp() {
  return <SignUpComponent />;
}
