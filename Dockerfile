ARG NODE_VERSION=20.19.4

FROM node:${NODE_VERSION}-alpine

WORKDIR /usr/src/app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend/ .

RUN npm run build

ENV NODE_ENV=production

WORKDIR /usr/src/app

RUN --mount=type=bind,source=package.json,target=package.json \
    --mount=type=bind,source=package-lock.json,target=package-lock.json \
    --mount=type=cache,target=/root/.npm \
    npm ci --omit=dev

USER node

COPY . .

ARG PORT=8080
ENV PORT=${PORT}

EXPOSE ${PORT}

CMD ["node","server.js"]