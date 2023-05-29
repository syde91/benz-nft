# Use the official Node.js image as the base image
FROM node:14

# Set the working directory in the container
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install the app dependencies
RUN npm install

# Copy the entire app directory to the container
COPY . .

# Build the React app for production
RUN npm run build

# Set the command to start the app
CMD ["npm", "start"]
