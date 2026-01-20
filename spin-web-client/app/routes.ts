import { type RouteConfig, index, route, layout } from '@react-router/dev/routes'

export default [
  layout('app.tsx', [
    index('routes/landing.tsx'),
    route('signup', 'routes/signup.tsx',),
    route('login', 'routes/login.tsx'),
    route('home', 'routes/home.tsx'),
    route('browse', 'routes/browse.tsx'),
    route('release/:rid', 'routes/release.tsx'),
    route('upcoming', 'routes/upcomingAll.tsx'),
    route('upcoming/:rid', 'routes/upcoming.tsx'),
    layout('authLayout.tsx', [
      route('manage/notifications', 'routes/notifications.tsx'),
      route('manage/notifications/channels', 'routes/channels.tsx'),
      route('manage/notifications/filters', 'routes/filters.tsx'),
      route('manage/user', 'routes/user.tsx'),
    ])
  ])
] satisfies RouteConfig
