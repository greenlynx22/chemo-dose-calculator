import 'dotenv/config';

export const env = {
  databaseUrl: process.env.DATABASE_URL || 'postgresql://app:app@localhost:5432/app?schema=public',
  warehouse: {
    name: process.env.WAREHOUSE_NAME || 'Dallas Consolidation Center',
    line1: process.env.WAREHOUSE_LINE1 || '123 Warehouse Rd',
    city: process.env.WAREHOUSE_CITY || 'Dallas',
    state: process.env.WAREHOUSE_STATE || 'TX',
    zip: process.env.WAREHOUSE_ZIP || '75201',
    country: process.env.WAREHOUSE_COUNTRY || 'US',
  },
  userCodePrefix: process.env.USER_CODE_PREFIX || 'PH',
};

