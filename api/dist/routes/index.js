"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const signup_1 = require("./signup");
const router = (0, express_1.Router)();
router.get('/health', (_req, res) => {
    res.json({ ok: true, ts: new Date().toISOString() });
});
router.use('/signup', signup_1.signupRouter);
exports.default = router;
