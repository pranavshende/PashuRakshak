require('dotenv').config();
const prisma = require('./src/config/db');

async function main() {
  console.log('Seeding Nagpur Outbreak Data...');
  const mockData = [
    { diseaseName: 'Lumpy Skin Disease', latitude: 21.1558, longitude: 79.0982, severity: 'CRITICAL' }, 
    { diseaseName: 'Foot & Mouth Disease', latitude: 21.2200, longitude: 79.2000, severity: 'HIGH' }, 
    { diseaseName: 'Bovine Mastitis', latitude: 21.1200, longitude: 79.0500, severity: 'Medium' }, 
    { diseaseName: 'Lumpy Skin Disease', latitude: 21.3800, longitude: 78.9100, severity: 'HIGH' }, 
    { diseaseName: 'Black Quarter', latitude: 20.8500, longitude: 79.3200, severity: 'Medium' } 
  ];
  
  await prisma.diseaseReport.createMany({ data: mockData });
  console.log('Successfully seeded disease reports around Nagpur.');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
