"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.composeUsAddressForUser = composeUsAddressForUser;
const env_1 = require("../env");
function composeUsAddressForUser(params) {
    const { fullName, userCode } = params;
    const line1 = `${env_1.env.warehouse.line1}`;
    const line2 = `${env_1.env.warehouse.name} - Attn: ${fullName} (${userCode})`;
    return {
        name: fullName,
        line1,
        line2,
        city: env_1.env.warehouse.city,
        state: env_1.env.warehouse.state,
        zip: env_1.env.warehouse.zip,
        country: env_1.env.warehouse.country,
    };
}
