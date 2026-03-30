FROM --platform=linux/amd64 mcr.microsoft.com/playwright:v1.58.2-jammy AS build
WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .
COPY packages ./packages

WORKDIR /app/images/image-get-on

RUN npm install
RUN npm run build


FROM --platform=linux/amd64 mcr.microsoft.com/playwright:v1.58.2-jammy
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app /app

CMD ["npm", "start"]