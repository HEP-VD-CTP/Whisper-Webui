# Use a lightweight Node.js image
FROM node:18-alpine

# Create and set the working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY ./packages/backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application files
COPY ./packages/backend .

# Expose port 3000 from inside the container
EXPOSE 3000

# Command to run the Fastify server
CMD ["npm", "run", "dev"]