// Donation addresses shown in the site footer. This is the ONLY place they live.
// Checked (checksum) before adding: BTC bech32, TRON base58check, TON CRC16, ETH EIP-55.
// Change an address here and update the matching string in CryptoSupport.test.tsx on purpose, so a typo can never ship silently.
export type SupportAddress = {
  id: 'gram' | 'btc' | 'erc20' | 'trc20';
  label: string;   // short name on the button
  network: string; // what the sender must choose in their wallet
  address: string;
};

export const SUPPORT_ADDRESSES: readonly SupportAddress[] = [
  { id: 'gram', label: 'GRAM', network: 'شبکه TON', address: 'UQBLFRDMSwLDBBPZH7CrGJ9Z3ZfduyEvrXkdsjQIAGUCJ-or' },
  { id: 'btc', label: 'BTC', network: 'شبکه بیت‌کوین', address: 'bc1qjppn5cs6vrj5gyjfrh999xewmcrt38m4ydmgnt' },
  { id: 'erc20', label: 'ERC20', network: 'شبکه اتریوم', address: '0xF6b013319792B2642ef8e957c101D70D727dA509' },
  { id: 'trc20', label: 'TRC20', network: 'شبکه ترون', address: 'TCh6NRNj3sSbF1FfH8DvkyzbkhYL6VygnW' },
];
