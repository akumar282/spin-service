FROM --platform=linux/amd64 mcr.microsoft.com/playwright:v1.58.2-jammy AS build
WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .

RUN npm run build

# install google chrome
RUN apt-get update && apt-get install -y wget gnupg \
 && wget -q -O - https://dl.google.com/linux/linux_signing_key.pub | gpg --dearmor -o /usr/share/keyrings/google.gpg \
 && echo "deb [arch=amd64 signed-by=/usr/share/keyrings/google.gpg] http://dl.google.com/linux/chrome/deb/ stable main" > /etc/apt/sources.list.d/google.list \
 && apt-get update \
 && apt-get install -y google-chrome-stable


FROM --platform=linux/amd64 mcr.microsoft.com/playwright:v1.58.2-jammy
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app /app
COPY --from=build /usr/bin/google-chrome /usr/bin/google-chrome
COPY --from=build /opt/google /opt/google

CMD ["npm", "start"]