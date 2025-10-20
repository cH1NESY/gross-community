FROM node:20-alpine

WORKDIR /app

# Install deps separately to leverage Docker layer caching
COPY package*.json ./
RUN npm ci

# Copy the rest of the app
COPY . .

# Expose Vite dev server port
EXPOSE 5173

# Default command runs Vite dev server listening on all interfaces
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]


