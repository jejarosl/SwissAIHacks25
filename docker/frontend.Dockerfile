# Development stage
FROM node:18-alpine as development

WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies using npm install instead of npm ci
RUN npm install

# Copy the rest of the application
COPY . .

# Expose port
EXPOSE 3000

# Start the application in development mode
CMD ["npm", "run", "dev"]

# Production build stage
FROM node:18-alpine as build

WORKDIR /app

# Copy package.json
COPY package.json ./

# Install dependencies using npm install
RUN npm install

# Copy the rest of the application
COPY . .

# Set a default API URL for the build process
# This allows the build to complete but will be overridden at runtime
ENV NEXT_PUBLIC_API_URL=http://api-placeholder

# Build the application
RUN npm run build

# Production stage
FROM node:18-alpine as production

WORKDIR /app

# Copy package.json
COPY package.json ./

# Install only production dependencies
RUN npm install --only=production

# Copy the built application from the build stage
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/node_modules ./node_modules

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]