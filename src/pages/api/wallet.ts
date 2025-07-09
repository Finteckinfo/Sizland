import axiosInstance from "./axiosInstace";

export const generateWallet = async () => {
  try {
    const response = await axiosInstance.get("https://web-production-61e73.up.railway.app/wallet/generate_wallet");
    return response.data;
  } catch (error) {
    console.error("Failed to generate wallet:", error);
    throw error;
  }
};
