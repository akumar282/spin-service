import { type RouteConfig, index, route } from '@react-router/dev/routes'

export default [
  index('routes/landing.tsx'),
  route('signup', 'routes/signup.tsx'),
  route('login', 'routes/login.tsx'),
  route('home', 'routes/home.tsx'),
  route('manage/notifications', 'routes/notifications.tsx'),
  route('manage/notifications/channels', 'routes/channels.tsx')
] satisfies RouteConfig
