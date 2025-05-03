RUN NPM install
edit DB url in schema.prisma
npx prisma migrate dev --name init
npx prisma generate
npx prisma db seed
npm run start