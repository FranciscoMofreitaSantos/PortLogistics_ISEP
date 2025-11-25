FROM node:20-alpine AS build
WORKDIR /app

COPY . .

RUN npm install
RUN npm run build
 

FROM nginx:alpine AS final
RUN rm /etc/nginx/conf.d/default.conf

COPY --from=build /app/build /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]