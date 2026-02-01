import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Register',
    description: 'Create a new NepoSMM account and start boosting your social media presence today.',
}

export default function RegisterLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
