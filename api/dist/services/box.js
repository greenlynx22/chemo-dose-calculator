"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.openBoxForUser = openBoxForUser;
const date_fns_1 = require("date-fns");
const prisma_1 = require("../prisma");
async function openBoxForUser(userId) {
    const now = new Date();
    const cutoff = (0, date_fns_1.endOfMonth)(now);
    // If there is already an OPEN box for this month, return it
    const existing = await prisma_1.prisma.box.findFirst({
        where: {
            userId,
            status: 'OPEN',
            cutoffMonth: { gte: new Date(now.getFullYear(), now.getMonth(), 1), lte: cutoff },
        },
    });
    if (existing)
        return existing;
    return prisma_1.prisma.box.create({
        data: {
            userId,
            status: 'OPEN',
            cutoffMonth: cutoff,
        },
    });
}
