import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Affiliate Program - Earn Money with NepoSMM',
    description: 'Join the NepoSMM affiliate program and earn commissions by referring users to the best SMM panel in Nepal.',
    keywords: ['SMM affiliate', 'earn money social media', 'NepoSMM referral program', 'make money online Nepal'],
}

export default function AffiliatesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
