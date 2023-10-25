FROM node:14.4.0-alpine

# Running the swagger generation, requires a jdk8 dependency, since that library is a java library
RUN apk update && apk add openjdk8

# install libraries
WORKDIR /usr/src/client
COPY ./client/package*.json ./
RUN npm install

# clean any artifacts of src and dist
COPY ./client ./
RUN rm -rf src && rm -rf dist && mkdir src && mkdir dist

# copy over the backend for the source
WORKDIR /usr/src/backend
COPY ./backend ./

# run the continous watching from the client directory
WORKDIR /usr/src/client
EXPOSE 8080
CMD ["npm", "run", "dev"]