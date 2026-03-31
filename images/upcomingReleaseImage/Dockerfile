FROM --platform=linux/amd64 public.ecr.aws/docker/library/node:20 AS build
WORKDIR /app

COPY package*.json /app/
COPY images/ /app/images/
COPY packages/ /app/packages/

RUN --mount=type=cache,target=/root/.npm npm ci --workspace=images/upcomingReleaseImage

WORKDIR /app/images/upcomingReleaseImage
RUN npm run build

FROM --platform=linux/amd64 public.ecr.aws/docker/library/node:20-slim
WORKDIR /app/images/upcomingReleaseImage

ENV NODE_ENV production
USER node

COPY --from=build /app /app

EXPOSE 3000
CMD ["npm", "start"]
