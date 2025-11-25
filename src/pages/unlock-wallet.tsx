import { PageLayout } from '@/components/page-layout';
import { WalletUnlock } from '@/components/ui/walletUnlock';

const UnlockWalletPage = () => {
  return (
    <PageLayout
      title="Unlock Wallet"
      description="Unlock your Sizland wallet with password or recovery phrase"
      justify="center"
    >
      <div className="max-w-2xl mx-auto w-full">
        <WalletUnlock />
      </div>
    </PageLayout>
  );
};

export default UnlockWalletPage;
