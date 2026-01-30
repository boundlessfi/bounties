import type { Metadata } from "next";

export const metadata: Metadata = {
    title: "Wallet | Bounties",
    description: "Manage your abstracted wallet, view assets, track earnings, and off-ramp funds directly to your bank account.",
};

export default function WalletLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
}
