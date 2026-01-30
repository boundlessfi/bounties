import { WalletInfo } from '@/types/wallet'

// Mock Stellar wallet with proper address format
export const mockWalletInfo: WalletInfo = {
    address: 'GC64SVY3XSYEE7MYADTEQNO3ACCWJ6NLWNNJLPO2FGS4I2PCNBPVNZOP',
    displayName: 'John Doe',
    balance: 0,
    balanceCurrency: 'USD',
    assets: [],
    recentActivity: [],
    has2FA: false,
    isConnected: true
}

// Example with assets and activity (for testing populated states)
export const mockWalletWithAssets: WalletInfo = {
    address: 'GC64SVY3XSYEE7MYADTEQNO3ACCWJ6NLWNNJLPO2FGS4I2PCNBPVNZOP',
    displayName: 'Jane Smith',
    balance: 1250.50,
    balanceCurrency: 'USD',
    assets: [
        {
            id: '1',
            tokenSymbol: 'XLM',
            tokenName: 'Stellar Lumens',
            amount: 5000,
            usdValue: 625.00
        },
        {
            id: '2',
            tokenSymbol: 'USDC',
            tokenName: 'USD Coin',
            amount: 625.50,
            usdValue: 625.50
        }
    ],
    recentActivity: [
        {
            id: '1',
            type: 'earning',
            amount: 500,
            currency: 'USDC',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            description: 'Bounty reward - Feature Implementation'
        },
        {
            id: '2',
            type: 'earning',
            amount: 250,
            currency: 'XLM',
            date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            description: 'Bounty reward - Bug Fix'
        },
        {
            id: '3',
            type: 'withdrawal',
            amount: 100,
            currency: 'USDC',
            date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'completed',
            description: 'Withdrawal to external wallet'
        }
    ],
    has2FA: true,
    isConnected: true
}

// Helper to truncate Stellar address
export function truncateStellarAddress(address: string): string {
    if (address.length <= 8) return address
    return `${address.slice(0, 4)}...${address.slice(-4)}`
}
