import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'API Configuration',
}

export default function AdminApiConfigLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
