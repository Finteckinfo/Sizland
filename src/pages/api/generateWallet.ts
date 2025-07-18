import axios from 'axios';

export const generateWallet = async () => {
  try {
    const res = await axios.get('/api/wallet');
    return res.data;
  } catch (error) {
    console.error('Wallet creation failed:', error);
    throw error;
  }
};
