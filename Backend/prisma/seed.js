require('dotenv').config();
const prisma = require('../src/config/db');
const bcrypt = require('bcrypt');

async function seed() {
  console.log('🌱 Starting database seed...\n');

  try {
    // =====================================================
    // 1. USERS (Farmers, Vets, Admin)
    // =====================================================
    console.log('[1/6] Seeding Users...');

    const hashedPass = await bcrypt.hash('password123', 10);

    const admin = await prisma.user.upsert({
      where: { phone: '9000000001' },
      update: { password: hashedPass },
      create: { name: 'Admin PashuRakshak', phone: '9000000001', role: 'ADMIN', password: hashedPass }
    });

    const farmer1 = await prisma.user.upsert({
      where: { phone: '9000000002' },
      update: { password: hashedPass },
      create: { name: 'Ramesh Patil', phone: '9000000002', role: 'FARMER', password: hashedPass }
    });

    const farmer2 = await prisma.user.upsert({
      where: { phone: '9000000003' },
      update: { password: hashedPass },
      create: { name: 'Sunita Devi', phone: '9000000003', role: 'FARMER', password: hashedPass }
    });

    console.log(`✅ Created Users: Admin, ${farmer1.name}, ${farmer2.name}`);

    // =====================================================
    // 2. VETS
    // =====================================================
    console.log('\n[2/6] Seeding Veterinarians...');

    const vets = [
      { name: 'Dr. Arjun Sharma', phone: '9011111111', latitude: 19.0760, longitude: 72.8777 },  // Mumbai
      { name: 'Dr. Priya Kulkarni', phone: '9011111112', latitude: 18.5204, longitude: 73.8567 }, // Pune
      { name: 'Dr. Sanjay More', phone: '9011111113', latitude: 21.1458, longitude: 79.0882 },    // Nagpur
      { name: 'Dr. Kavita Singh', phone: '9011111114', latitude: 20.0110, longitude: 73.7903 },   // Nashik
      { name: 'Dr. Vikram Rao', phone: '9011111115', latitude: 17.6868, longitude: 75.3295 },     // Solapur
    ];

    for (const vet of vets) {
      await prisma.vet.upsert({
        where: { id: vet.phone }, // Use phone as temp unique key
        update: {},
        create: { name: vet.name, phone: vet.phone, latitude: vet.latitude, longitude: vet.longitude }
      }).catch(() => prisma.vet.create({ data: vet }));
    }
    console.log(`✅ Created ${vets.length} veterinarians across Maharashtra`);

    // =====================================================
    // 3. ANIMALS (Digital Twins for Farmer 1)
    // =====================================================
    console.log('\n[3/6] Seeding Animals (Digital Twins)...');

    const animal1 = await prisma.animal.upsert({
      where: { tagId: 'TAG-MH-001' },
      update: {},
      create: {
        tagId: 'TAG-MH-001', name: 'Gauri', breed: 'Gir',
        weight: 320, dateOfBirth: new Date('2020-03-15'), userId: farmer1.id
      }
    });

    const animal2 = await prisma.animal.upsert({
      where: { tagId: 'TAG-MH-002' },
      update: {},
      create: {
        tagId: 'TAG-MH-002', name: 'Shyama', breed: 'HF Cross',
        weight: 290, dateOfBirth: new Date('2021-07-22'), userId: farmer1.id
      }
    });

    const animal3 = await prisma.animal.upsert({
      where: { tagId: 'TAG-MH-003' },
      update: {},
      create: {
        tagId: 'TAG-MH-003', name: 'Radha', breed: 'Sahiwal',
        weight: 275, userId: farmer2.id
      }
    });

    console.log(`✅ Created 3 animals: ${animal1.name}, ${animal2.name}, ${animal3.name}`);

    // =====================================================
    // 4. VACCINATIONS
    // =====================================================
    console.log('\n[4/6] Seeding Vaccinations...');

    await prisma.vaccination.createMany({
      data: [
        { animalId: animal1.id, vaccineName: 'FMD Booster', dateAdministered: new Date('2025-01-10'), nextDueDate: new Date('2026-01-10') },
        { animalId: animal1.id, vaccineName: 'HS Vaccine', dateAdministered: new Date('2025-03-20'), nextDueDate: new Date('2026-03-20') },
        { animalId: animal2.id, vaccineName: 'FMD Booster', dateAdministered: new Date('2025-02-15'), nextDueDate: new Date('2026-02-15') },
        { animalId: animal3.id, vaccineName: 'BQ Vaccine', dateAdministered: new Date('2025-04-05'), nextDueDate: new Date('2026-04-05') },
      ],
      skipDuplicates: true
    });
    console.log('✅ Created 4 vaccination records');

    // =====================================================
    // 5. MILK RECORDS (Last 7 days for animal1 and animal2)
    // =====================================================
    console.log('\n[5/6] Seeding Milk Records...');

    const milkData = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      milkData.push({ animalId: animal1.id, date: d, quantityLiters: 12 + Math.random() * 3 });
      milkData.push({ animalId: animal2.id, date: d, quantityLiters: 9 + Math.random() * 2 });
    }
    await prisma.milkRecord.createMany({ data: milkData, skipDuplicates: true });
    console.log('✅ Created 14 milk records (7 days × 2 animals)');

    // =====================================================
    // 6. DISEASE OUTBREAK REPORTS (Maharashtra Heatmap)
    // =====================================================
    console.log('\n[6/6] Seeding Disease Outbreak Reports (GIS Heatmap)...');

    const outbreakData = [
      { diseaseName: 'Lumpy Skin Disease', latitude: 19.0760, longitude: 72.8777, severity: 'High' },
      { diseaseName: 'Lumpy Skin Disease', latitude: 19.2183, longitude: 72.9781, severity: 'High' },
      { diseaseName: 'FMD', latitude: 18.5204, longitude: 73.8567, severity: 'Medium' },
      { diseaseName: 'FMD', latitude: 18.6298, longitude: 73.7997, severity: 'Low' },
      { diseaseName: 'Mastitis', latitude: 21.1458, longitude: 79.0882, severity: 'Low' },
      { diseaseName: 'Lumpy Skin Disease', latitude: 20.0110, longitude: 73.7903, severity: 'High' },
      { diseaseName: 'HS', latitude: 17.6868, longitude: 75.3295, severity: 'Medium' },
      { diseaseName: 'FMD', latitude: 19.8762, longitude: 75.3433, severity: 'High' },  // Aurangabad
    ];

    await prisma.diseaseReport.createMany({ data: outbreakData, skipDuplicates: true });
    console.log(`✅ Created ${outbreakData.length} disease outbreak reports across Maharashtra`);

    // =====================================================
    // 7. MEDICINES
    // =====================================================
    console.log('\n[7/7] Seeding Medicines...');
    const medicines = [
      // Lumpy Skin Disease
      { diseaseKey: 'Lumpy Skin Disease', name: 'Antibiotics', usageInstructions: 'Consult vet for secondary infections. Do not use without vet prescription.' },
      { diseaseKey: 'Lumpy Skin Disease', name: 'Anti-inflammatory drugs', usageInstructions: 'To reduce fever and pain.' },
      { diseaseKey: 'Lumpy Skin Disease', name: 'Wound Care Spray', usageInstructions: 'Apply topically 2x daily. Keep lesions clean.' },
      
      // FMD
      { diseaseKey: 'FMD', name: 'FMD Vaccine', usageInstructions: 'Annual booster. Preventative only. Will not cure active infection.' },
      { diseaseKey: 'FMD', name: 'Mild disinfectants', usageInstructions: 'Wash hooves 2x daily. E.g. Potassium Permanganate solution.' },
      { diseaseKey: 'FMD', name: 'Painkillers (Meloxicam)', usageInstructions: 'Consult Vet. For severe pain and lameness.' },
      
      // Mastitis
      { diseaseKey: 'Mastitis', name: 'Intramammary Antibiotics', usageInstructions: '1 tube per infected quarter every 12h. E.g. Cefquinome or Amoxicillin.' },
      { diseaseKey: 'Mastitis', name: 'NSAIDs', usageInstructions: 'As prescribed. To reduce swelling and pain.' },
      { diseaseKey: 'Mastitis', name: 'Frequent Milking', usageInstructions: 'Every 2-4 hours. Strip out infected milk completely.' }
    ];

    await prisma.medicine.deleteMany(); // Clear existing medicines first
    await prisma.medicine.createMany({ data: medicines });
    console.log(`✅ Created ${medicines.length} medicine records`);

    // =====================================================
    // SUMMARY
    // =====================================================
    console.log('\n=========================================');
    console.log('✅ DATABASE SEEDED SUCCESSFULLY!');
    console.log('=========================================');
    console.log('Test Login Credentials:');
    console.log('  Farmer 1 → Phone: 9000000002');
    console.log('  Farmer 2 → Phone: 9000000003');
    console.log('  Admin    → Phone: 9000000001');
    console.log('=========================================\n');

  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seed();
