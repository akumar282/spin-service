# Build stage
FROM --platform=linux/amd64 mcr.microsoft.com/playwright:v1.58.2-jammy AS build
WORKDIR /app

COPY package*.json ./
RUN --mount=type=cache,target=/root/.npm npm ci

COPY . .
CMD ["npm", "run", "build"]

# Runtime stage
FROM --platform=linux/amd64 mcr.microsoft.com/playwright:v1.58.2-jammy
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app /app

EXPOSE 3000
CMD ["npm", "start"]
