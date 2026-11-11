FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build
RUN npm install -g serve

# Default port if not provided
ENV PORT=3000
EXPOSE $PORT

# Serve the 'dist' directory on the specified port
CMD sh -c "serve -s dist -l ${PORT}"
