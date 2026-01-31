import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Order History',
}

export default function OrdersLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
