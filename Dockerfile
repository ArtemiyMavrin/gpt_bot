FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm install prisma -g
RUN npx prisma migrate deploy
ENV PORT=3000
EXPOSE $PORT
CMD ["npm", "start"]