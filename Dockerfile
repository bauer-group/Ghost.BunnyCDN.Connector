FROM node:22

# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
COPY package*.json ./

RUN npm install

# Bundle app source
COPY . .

# Build the TypeScript code
RUN npm run build

EXPOSE 3000
CMD [ "npm", "start" ]
