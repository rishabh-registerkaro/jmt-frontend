# Use Node.js official image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy project files
COPY . .

# Build Next.js app
RUN npm run build

# Expose port
EXPOSE 3002

# Start app (`next start -p 3002`)
CMD ["npm", "run", "start"]
