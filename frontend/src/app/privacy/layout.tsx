import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Privacy Policy - NepoSMM',
    description: 'Read the privacy policy for NepoSMM. Learn how we collect, use, and protect your personal information.',
    keywords: ['Privacy Policy', 'Data Protection', 'NepoSMM Privacy', 'SMM Privacy'],
}

export default function PrivacyLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
