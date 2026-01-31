import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'New Order',
}

export default function NewOrderLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
