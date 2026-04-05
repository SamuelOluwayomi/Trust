"use client";

import { PrivyProvider } from "@privy-io/react-auth";

const hashkeyChain = {
  id: 133,
  name: "HashKey Chain Testnet",
  network: "hashkey-testnet",
  nativeCurrency: {
    name: "HSK",
    symbol: "HSK",
    decimals: 18,
  },
  rpcUrls: {
    default: {
      http: ["https://testnet.hsk.xyz"],
    },
  },
  blockExplorers: {
    default: {
      name: "HashKey Explorer",
      url: "https://testnet-explorer.hsk.xyz",
    },
  },
};

export default function PrivyClientProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        loginMethods: ["google", "wallet"],
        appearance: {
          theme: "dark",
          accentColor: "#10b981",
          logo: "/shield.svg", // Using the green shield logo we set up earlier
        },
        embeddedWallets: {
          ethereum: {
            createOnLogin: "off",
          },
        },
        supportedChains: [hashkeyChain],
        defaultChain: hashkeyChain,
      }}
    >
      {children}
    </PrivyProvider>
  );
}
