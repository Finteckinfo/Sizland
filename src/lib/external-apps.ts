/** Product subdomains — override via NEXT_PUBLIC_* in .env.local */

export const SIZLAND_WALLET_URL =
  process.env.NEXT_PUBLIC_SIZLAND_WALLET_URL?.replace(/\/$/, '') ||
  'https://wallet.siz.land'

export const ERP_URL =
  process.env.NEXT_PUBLIC_ERP_URL?.replace(/\/$/, '') || 'https://erp.siz.land'

export const CRM_URL =
  process.env.NEXT_PUBLIC_CRM_URL?.replace(/\/$/, '') || 'https://crm.siz.land'

export const SOLUTIONS_URL =
  process.env.NEXT_PUBLIC_SOLUTIONS_URL?.replace(/\/$/, '') ||
  'https://solutions.siz.land'

export const BUY_LAND_URL =
  process.env.NEXT_PUBLIC_BUY_LAND_URL?.replace(/\/$/, '') || 'https://buy.siz.land'

export const MYTAB_URL =
  process.env.NEXT_PUBLIC_MYTAB_URL?.replace(/\/$/, '') || 'https://mytab.siz.land'
