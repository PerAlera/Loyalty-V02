import fs from 'fs';
import path from 'path';

const envPath = path.resolve('.env');
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf8');
  const dbUrlLine = envFile.split('\n').find(line => line.startsWith('DATABASE_URL'));
  if (dbUrlLine) {
    let url = dbUrlLine.split('=')[1].trim();
    if (url.startsWith('"') && url.endsWith('"')) {
      url = url.slice(1, -1);
    }
    process.env.DATABASE_URL = url;
  }
}

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findUnique({
    where: { id: 'cmrrt9zhs0000rlz1vcsi9j3b' }
  });
  
  if (user) {
    console.log(`USER_FOUND: ${user.name} ${user.surname} (Tel: ${user.phone})`);
  } else {
    console.log('USER_NOT_FOUND');
  }
}

main().finally(() => prisma.$disconnect());
