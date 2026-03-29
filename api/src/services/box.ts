import { endOfMonth } from 'date-fns';
import { prisma } from '../prisma';

export async function openBoxForUser(userId: string) {
  const now = new Date();
  const cutoff = endOfMonth(now);

  // If there is already an OPEN box for this month, return it
  const existing = await prisma.box.findFirst({
    where: {
      userId,
      status: 'OPEN',
      cutoffMonth: { gte: new Date(now.getFullYear(), now.getMonth(), 1), lte: cutoff },
    },
  });
  if (existing) return existing;

  return prisma.box.create({
    data: {
      userId,
      status: 'OPEN',
      cutoffMonth: cutoff,
    },
  });
}

