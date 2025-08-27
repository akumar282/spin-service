import type { Route } from "./+types/home";
import { NotificationsComponent } from '~/modules/notifcations/notifications';

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Notifications() {
  return <NotificationsComponent />;
}