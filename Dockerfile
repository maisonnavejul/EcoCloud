# Start from the official Node.js Alpine image
FROM node:alpine

# Set the working directory in the Docker container
WORKDIR /usr/src/app

# Install necessary system dependencies
# python3 is added if you need it for any build scripts
# make, g++, and libc6-compat are necessary for compiling native addons
RUN apk update && \
    apk add --no-cache python3 make g++ libc6-compat

# Copy package.json and package-lock.json to leverage Docker caching
COPY package*.json ./

# Install all dependencies in package.json, except for bcrypt and sqlite3
# which will be handled separately
RUN npm install --omit=optional --build-from-source

# Specifically handle sqlite3 and bcrypt installations from the GitHub tarball or by compiling
RUN npm install https://github.com/tryghost/node-sqlite3/tarball/master --build-from-source && \
    npm install bcrypt --build-from-source

# Copy the rest of your application's source code from your local directory to the Docker container
COPY . .

# Expose the port the app runs on
EXPOSE 3000

# Command to run your app using Node.js
CMD ["node", "index.js"]
