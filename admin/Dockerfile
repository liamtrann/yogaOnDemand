FROM node:14.4.0-alpine

ARG REACT_APP_VERSION
ARG REACT_APP_PROJECT_NAME
ARG REACT_APP_DOCS_URL
ARG REACT_APP_BACKEND_URL
ARG REACT_APP_ADMIN_URL

ENV REACT_APP_VERSION=$REACT_APP_VERSION
ENV REACT_APP_PROJECT_NAME=$REACT_APP_PROJECT_NAME
ENV REACT_APP_DOCS_URL=$REACT_APP_DOCS_URL
ENV REACT_APP_BACKEND_URL=$REACT_APP_BACKEND_URL
ENV REACT_APP_ADMIN_URL=$REACT_APP_ADMIN_URL

# java
RUN apk update && apk add openjdk8

# need the backend source in order to compile client
WORKDIR /usr/src/backend
COPY ./backend ./

# copy over the client files
WORKDIR /usr/src/client
COPY ./client ./
RUN npm install

# build client
RUN npm run build

# delete backend as it is no longer necessary
RUN rm -rf ../backend

# copy over admin files
WORKDIR /usr/src/admin
COPY ./admin ./
RUN npm install
RUN npm link ../client
RUN npm run build

EXPOSE 8080

CMD ["npm", "run", "production"]