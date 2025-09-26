FROM node:18

# Set working directory
WORKDIR /app

# Install dependencies first (better Docker layer caching)
COPY package*.json ./
RUN npm install

# Copy frontend code
COPY . .

# Expose Next.js/React dev server port
EXPOSE 3000

# Default command
CMD ["npm", "run", "dev"]
