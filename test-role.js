const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  await prisma.user.updateMany({
    data: { role: 'ADMIN' }
  });
  console.log("Updated all users to ADMIN");
  const users = await prisma.user.findMany({ select: { email: true, role: true } });
  console.log(users);
}
run();
