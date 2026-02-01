import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Terms of Service & Refund Policy',
    description: 'Read the terms of service, usage policy, and refund policy for NepoSMM. Understand our rules for social media growth services.',
    keywords: ['Terms of Service', 'Refund Policy', 'Privacy Policy', 'SMM Rules'],
}

export default function TermsLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
