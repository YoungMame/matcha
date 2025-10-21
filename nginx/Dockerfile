FROM alpine:3.21.3

WORKDIR /usr/src/matcha

RUN apk update --no-cache
RUN apk add nginx openssl --no-cache

RUN mkdir -p /etc/nginx/ssl     \
             /var/run/nginx

RUN openssl req -x509 -nodes \
-out /etc/nginx/ssl/matcha.crt \
-keyout /etc/nginx/ssl/matcha.key \
-subj "/C=FR/ST=IDF/L=le havre/O=42/OU=42/CN=matcha.42.fr/UID=matcha"

COPY nginx.conf /etc/nginx/nginx.conf

ENTRYPOINT [ "nginx", "-g", "daemon off;" ]