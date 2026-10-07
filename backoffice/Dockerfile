FROM node:24-alpine AS build
WORKDIR /app
# VITE_MODE decide el script de build (docker | prod) y con él el `base` del
# bundle: el panel solo se monta bajo /admin cuando el modo NO es dev.
ARG VITE_MODE=docker
# La URL de la API y del sitio son constantes de BUILD, no secretos. Se pasan
# como build-arg desde compose / GitHub Actions para que la imagen no dependa de
# que exista un .env.prod dentro del contexto (los .env reales no se versionan).
# Vite expone al bundle toda variable de entorno VITE_* del proceso de build, y
# estas tienen prioridad sobre los archivos .env.
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
