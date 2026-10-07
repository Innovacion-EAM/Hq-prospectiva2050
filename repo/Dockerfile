FROM node:24-alpine AS build
WORKDIR /app
# VITE_MODE decide el script de build (docker | prod) y con él el `base` del
# bundle: el repositorio solo se monta bajo /repo cuando el modo NO es dev.
ARG VITE_MODE=docker
# La URL de la API es una constante de BUILD, no un secreto. Se pasa como
# build-arg desde compose / GitHub Actions para que la imagen no dependa de
# que exista un .env.prod dentro del contexto.
ARG VITE_API_URL
ARG VITE_SITE_URL
ENV VITE_MODE=$VITE_MODE \
    VITE_API_URL=$VITE_API_URL \
    VITE_SITE_URL=$VITE_SITE_URL
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build:${VITE_MODE}

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]