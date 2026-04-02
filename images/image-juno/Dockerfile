FROM --platform=linux/amd64 mcr.microsoft.com/playwright:v1.58.2-jammy AS build
WORKDIR /app

COPY package*.json /app/
COPY images/ /app/images/
COPY packages/ /app/packages/

RUN --mount=type=cache,target=/root/.npm npm ci --workspace=images/image-get-on

WORKDIR /app/images/image-get-on
RUN npm run build

FROM --platform=linux/amd64 mcr.microsoft.com/playwright:v1.58.2-jammy
WORKDIR /app/images/image-get-on
ENV NODE_ENV=production

COPY --from=build /app /app

CMD ["npm", "start"]
