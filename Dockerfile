# Use the latest official Node.js Alpine image
FROM node:alpine

# Install build dependencies for native modules
RUN apk add --no-cache python3 make g++

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json to leverage Docker cache
COPY package*.json ./

# Install dependencies, including devDependencies for the build step
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the Tailwind CSS file
RUN npm run build:css

# Expose the port the app runs on
EXPOSE 1989

# Define the command to run the application
CMD ["npm", "start"]
