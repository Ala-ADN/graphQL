import { PrismaClient, Role } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.user.createMany({
    data: [
      { id: '1', name: 'Alice', email: 'alice@example.com', role: Role.ADMIN },
      { id: '2', name: 'Bob', email: 'bob@example.com', role: Role.USER },
    ],
  });

  await prisma.skill.createMany({
    data: [
      { id: '1', designation: 'GraphQL' },
      { id: '2', designation: 'TypeScript' },
      { id: '3', designation: 'React' },
    ],
  });

  await prisma.cv.create({
    data: {
      id: '1',
      name: 'Dev CV',
      age: 30,
      job: 'Developer',
      userId: '1',
      skills: { connect: [{ id: '1' }, { id: '2' }] },
    },
  });

  await prisma.cv.create({
    data: {
      id: '2',
      name: 'Design CV',
      age: 25,
      job: 'Designer',
      userId: '2',
      skills: { connect: [{ id: '3' }] },
    },
  });
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());