import { PrismaClient } from '@prisma/client';
import { config } from 'dotenv';

config();

const prisma = new PrismaClient({
  log: ['error'],
});

console.log('Mencoba koneksi ke Supabase...');

try {
  await prisma.$connect();
  const result = await prisma.$queryRaw`SELECT 1 as test`;
  console.log('✅ SUCCESS: Berhasil konek!', result);
} catch (err) {
  console.error('❌ GAGAL:', err.message);
  console.error('Error code:', err.errorCode);
} finally {
  await prisma.$disconnect();
}
