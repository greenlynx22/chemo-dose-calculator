import { env } from '../env';

export type UsAddress = {
  name: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
};

export function composeUsAddressForUser(params: { fullName: string; userCode: string }): UsAddress {
  const { fullName, userCode } = params;
  const line1 = `${env.warehouse.line1}`;
  const line2 = `${env.warehouse.name} - Attn: ${fullName} (${userCode})`;
  return {
    name: fullName,
    line1,
    line2,
    city: env.warehouse.city,
    state: env.warehouse.state,
    zip: env.warehouse.zip,
    country: env.warehouse.country,
  };
}

