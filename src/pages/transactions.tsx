import { PageLayout } from "@/components/page-layout";
import { Typography } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { NextPage } from "next";
import React from "react";

const TransactionsPage: NextPage = () => {
  const mockTransactions = [
    { type: "Send", amount: "100 ALGO", status: "Confirmed", to: "ADDR1234", id: "#TX1001" },
    { type: "Withdraw", amount: "20 ALGO", status: "Pending", to: "ADDR5678", id: "#TX1002" },
    { type: "Deposit", amount: "200 ALGO", status: "Confirmed", to: "My Wallet", id: "#TX1003" },
    { type: "Opt-In", amount: "-", status: "Confirmed", to: "Asset #123", id: "#TX1004" },
    { type: "Bridge", amount: "75 ALGO", status: "Failed", to: "BridgeNet", id: "#TX1005" },
    { type: "Rekey", amount: "-", status: "Confirmed", to: "ADDR9999", id: "#TX1006" },
  ];

  return (
    <PageLayout
      title="Wallet Transactions"
      description="Manage and review all wallet-related actions."
      justify="start"
    >
      {/* === Action Card === */}
      <section className="action-card enhanced-glass">
        <Typography variant="h2" className="action-title">Wallet Actions</Typography>
        <form className="action-form">
          <input type="text" placeholder="Recipient address" className="action-input" />
          <input type="number" placeholder="Amount (ALGO)" className="action-input" />
          <select className="action-select">
            <option>Send</option>
            <option>Withdraw</option>
            <option>Deposit</option>
            <option>Receive</option>
            <option>Opt-In</option>
            <option>Rekey</option>
            <option>Bridge</option>
          </select>
          <div className="action-buttons">
            <Button type="submit" className="btn-submit">Execute Transaction</Button>
          </div>
        </form>
      </section>

      {/* === Transactions Grid === */}
      <section className="transactions-grid">
        {mockTransactions.map((tx, index) => (
          <div key={index} className={`transaction-card ${tx.status.toLowerCase()}`}>
            <header className="tx-header">
              <h3>{tx.id}</h3>
              <span className="tx-status">{tx.status}</span>
            </header>
            <p><strong>Type:</strong> {tx.type}</p>
            <p><strong>Amount:</strong> {tx.amount}</p>
            <p><strong>To:</strong> {tx.to}</p>
          </div>
        ))}
      </section>
    </PageLayout>
  );
};

export default TransactionsPage;
