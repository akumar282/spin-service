import {
  type RouteConfig,
  route
} from '@react-router/dev/routes'

export default [
  route('hello/world', './main.tsx')
] satisfies RouteConfig