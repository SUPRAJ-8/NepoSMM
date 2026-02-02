"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"

export default function ReferralPage() {
    const router = useRouter()
    const params = useParams()
    const code = params?.code as string

    useEffect(() => {
        if (code) {
            // Store in localStorage for persistence
            localStorage.setItem("referral_code", code)

            // Redirect to landing page (keep the code saved in localStorage)
            router.replace('/')
        } else {
            router.replace('/')
        }
    }, [code, router])

    return (
        <div className="flex min-h-screen items-center justify-center bg-[#020617] text-white">
            <div className="flex flex-col items-center gap-4">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                <p className="text-muted-foreground animate-pulse">Redirecting...</p>
            </div>
        </div>
    )
}
