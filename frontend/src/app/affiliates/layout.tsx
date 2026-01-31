import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Affiliates',
}

export default function AffiliatesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
