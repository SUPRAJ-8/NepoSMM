import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Reset Password - Secure Your Account',
    description: 'Securely reset your NepoSMM account password.',
}

export default function ResetPasswordLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
