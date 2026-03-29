import { Router } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { customAlphabet } from 'nanoid';
import { prisma } from '../prisma';
import { env } from '../env';
import { composeUsAddressForUser } from '../services/address';
import { openBoxForUser } from '../services/box';

export const signupRouter = Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(1),
  phone: z.string().min(7).max(20).optional(),
});

const nanoId = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);

async function generateUniqueUserCode(): Promise<string> {
  const prefix = env.userCodePrefix.toUpperCase();
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = `${prefix}-${nanoId()}`;
    const exists = await prisma.user.findUnique({ where: { userCode: code } });
    if (!exists) return code;
  }
  throw new Error('Could not generate unique user code');
}

signupRouter.post('/', async (req, res, next) => {
  try {
    const parsed = signupSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
    }
    const { email, password, fullName, phone } = parsed.data;

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered' });
    }

    const userCode = await generateUniqueUserCode();
    const passwordHash = await bcrypt.hash(password, 10);

    const address = composeUsAddressForUser({ fullName, userCode });

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        fullName,
        phone,
        userCode,
        usAddressLine1: address.line1,
        usAddressLine2: address.line2,
        usCity: address.city,
        usState: address.state,
        usZip: address.zip,
        usCountry: address.country,
      },
    });

    const box = await openBoxForUser(user.id);

    return res.status(201).json({
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        userCode: user.userCode,
        usAddress: address,
      },
      openBox: { id: box.id, cutoffMonth: box.cutoffMonth },
    });
  } catch (err) {
    next(err);
  }
});

