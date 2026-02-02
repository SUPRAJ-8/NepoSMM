"use client"

import { useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { API_URL } from '@/lib/api-config';

export default function ReferralPage() {
    const router = useRouter()
    const params = useParams()
    const code = params?.code as string

    useEffect(() => {
        const recordAndRedirect = async () => {
            if (code) {
                // Store in localStorage for persistence
                localStorage.setItem("referral_code", code)

                // Record visit
                try {
                    await fetch(`${API_URL}/affiliates/visit`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code })
                    });
                } catch (e) {
                    console.error("Failed to record visit", e);
                }

                // Redirect to landing page
                router.replace('/')
            } else {
                router.replace('/')
            }
        };

        recordAndRedirect();
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
