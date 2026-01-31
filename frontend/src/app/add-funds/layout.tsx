import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Add Funds',
}

export default function AddFundsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
