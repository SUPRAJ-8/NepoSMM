import { Metadata } from 'next'

export const metadata: Metadata = {
    title: 'Category Management',
}

export default function AdminCategoriesLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return <>{children}</>
}
