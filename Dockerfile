FROM node:alpine

# Copy source
COPY node_modules node_modules
COPY src src
COPY package.json .

# Install the dependencies
RUN npm install --only=production

# Add curl
RUN apk --no-cache add curl

# Healthcheck routine.
HEALTHCHECK --interval=3s --timeout=3s CMD curl -sS --fail --head 0.0.0.0:80/_healthcheck || exit 1

# Expose HTTP port
EXPOSE 80

# Launch HTTP Server
CMD node src/index.mjs