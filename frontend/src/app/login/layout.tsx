import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Login',
    description: 'Log in to your NepoSMM account to manage your social media growth campaigns and orders.',
}

export default function LoginLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
