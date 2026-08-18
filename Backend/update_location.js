require('dotenv').config();
const prisma = require('./src/config/db');

async function main() {
  console.log('Running raw SQL update on Vet location column via DB Prisma instance...');
  const result = await prisma.$executeRawUnsafe(
    'UPDATE "Vet" SET location = ST_SetSRID(ST_MakePoint(longitude, latitude), 4326) WHERE location IS NULL;'
  );
  console.log('Location update count:', result);
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
