FROM node:boron

# Create app directory
RUN mkdir -p /var/www/wordz-api
WORKDIR /var/www/wordz-api

# Install app dependencies
COPY package.json /var/www/wordz-api
RUN npm install

# Bundle app source
COPY . /var/www/wordz-api

EXPOSE 3010

CMD [ "npm", "run", "start" ]
