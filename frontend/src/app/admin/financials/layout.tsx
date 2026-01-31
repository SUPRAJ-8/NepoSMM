import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Financial Management',
}

export default function AdminFinancialsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
