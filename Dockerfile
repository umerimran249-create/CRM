FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy entire project (needed for server to access .env from root)
COPY . .

# Expose port
EXPOSE 5000

# Start server (server/index.js loads .env from root)
CMD ["node", "server/index.js"]

