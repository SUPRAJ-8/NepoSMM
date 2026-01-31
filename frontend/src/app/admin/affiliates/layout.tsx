import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Affiliate Management',
}

export default function AdminAffiliatesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
