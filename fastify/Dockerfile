FROM node:24-alpine

WORKDIR  /usr/src/app

RUN apk add --no-cache pnpm curl

ARG NODE_ENV

#install dependencies
COPY assets/package.json .
COPY ./conf/pnpm_install.sh .
RUN chmod +x pnpm_install.sh && ./pnpm_install.sh

COPY ./assets/ ./

COPY ./conf/entrypoint.sh .
RUN chmod +x entrypoint.sh

ENTRYPOINT ["./entrypoint.sh"]