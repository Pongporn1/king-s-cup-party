# Multi-stage build for King's Cup Party
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including devDependencies for tsx)
RUN npm install

# Copy all source code
COPY . .

# Build frontend
RUN npm run build

# Expose port
EXPOSE 3001

# Set environment variables
ENV NODE_ENV=production

# Start the server with tsx
CMD ["npm", "run", "start"]
