import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'admin@seunovocarro.com.br';
  const password = '#Goto200k';
  const password_hash = await bcrypt.hash(password, 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: { 
        password_hash, 
        role: 'admin',
        status: 'active'
    },
    create: {
      email,
      password_hash,
      full_name: 'Administrador Oficial SNC',
      role: 'admin',
      status: 'active'
    }
  });

  console.log('✔ SUCESSO! Injeção de Banco Pura completada.');
  console.log('Dados injetados com Criptografia Bcrypt:', user.email);
}

main()
  .catch((e) => {
    console.error('Falha estrutural:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
