# backend/Dockerfile
FROM node:20-alpine

# Inštalácia pomocných nástrojov (ak by si neskôr potreboval buildovať natívne moduly)
RUN apk add --no-cache libc6-compat

WORKDIR /usr/src/app

# Najskôr package súbory - toto je dôležité pre cacheovanie
# Najskôr package súbory a Prisma schéma
COPY package*.json ./
COPY prisma ./prisma/

# Inštalujeme závislosti (v kontajneri)
RUN npm install

# Skopírujeme zvyšok zdrojového kódu
COPY . .

# Port musí súhlasiť s tým, čo máš v docker-compose
EXPOSE 5200

# Spúšťame v dev móde s watcherom
CMD ["npm", "run", "start:dev"]