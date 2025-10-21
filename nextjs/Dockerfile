FROM node:24-alpine

WORKDIR  /usr/src/app

RUN apk add --no-cache pnpm

ARG NODE_ENV

#install dependencies
COPY matcha/package.json .
COPY matcha/package-lock.json* matcha/pnpm-lock.yaml* ./
COPY ./conf/pnpm_install.sh .
RUN chmod +x pnpm_install.sh && ./pnpm_install.sh

#copy application files
COPY ./matcha/ ./

COPY ./conf/entrypoint.sh .
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]
