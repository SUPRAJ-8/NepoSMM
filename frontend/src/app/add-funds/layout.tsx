import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Add Funds - Deposit Balance',
    description: 'Add funds to your NepoSMM account using various local and international payment methods.',
}

export default function AddFundsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
