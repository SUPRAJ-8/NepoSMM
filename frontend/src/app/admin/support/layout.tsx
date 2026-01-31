import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Support Tickets Management',
}

export default function AdminSupportLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
