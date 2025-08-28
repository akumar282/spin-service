import type { Route } from "./+types/home";
import { ChannelsComponent } from '~/modules/notifcations/channels'

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export default function Channels() {
  return <ChannelsComponent />;
}