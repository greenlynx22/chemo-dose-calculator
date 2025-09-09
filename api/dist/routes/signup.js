"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.signupRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const nanoid_1 = require("nanoid");
const prisma_1 = require("../prisma");
const env_1 = require("../env");
const address_1 = require("../services/address");
const box_1 = require("../services/box");
exports.signupRouter = (0, express_1.Router)();
const signupSchema = zod_1.z.object({
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(8),
    fullName: zod_1.z.string().min(1),
    phone: zod_1.z.string().min(7).max(20).optional(),
});
const nanoId = (0, nanoid_1.customAlphabet)('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 8);
async function generateUniqueUserCode() {
    const prefix = env_1.env.userCodePrefix.toUpperCase();
    for (let attempt = 0; attempt < 5; attempt++) {
        const code = `${prefix}-${nanoId()}`;
        const exists = await prisma_1.prisma.user.findUnique({ where: { userCode: code } });
        if (!exists)
            return code;
    }
    throw new Error('Could not generate unique user code');
}
exports.signupRouter.post('/', async (req, res, next) => {
    try {
        const parsed = signupSchema.safeParse(req.body);
        if (!parsed.success) {
            return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });
        }
        const { email, password, fullName, phone } = parsed.data;
        const existing = await prisma_1.prisma.user.findUnique({ where: { email } });
        if (existing) {
            return res.status(409).json({ error: 'Email already registered' });
        }
        const userCode = await generateUniqueUserCode();
        const passwordHash = await bcryptjs_1.default.hash(password, 10);
        const address = (0, address_1.composeUsAddressForUser)({ fullName, userCode });
        const user = await prisma_1.prisma.user.create({
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
        const box = await (0, box_1.openBoxForUser)(user.id);
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
    }
    catch (err) {
        next(err);
    }
});
