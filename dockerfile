FROM  node:20-alpine

WORKDIR /projects

COPY package*.json ./

RUN npm ci 

COPY . .

EXPOSE 5000

USER node

CMD [ "npm" ,"start" ]