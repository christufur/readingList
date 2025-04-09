# Use Node.js LTS version
FROM node:18-alpine

# Create app directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application
COPY . .

# Expose the port your app runs on
EXPOSE 26053

# Define environment variable for MongoDB (you'll override this when running)
ENV MONGODB_URI=mongodb://localhost:27017/bookstore

#podman pod create --name bookstore-pod -p 26053:26053

# Command to run the app
CMD ["node", "app.js"]