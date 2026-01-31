"use client";

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { LogOut, AlertCircle } from "lucide-react"

export function SessionManager() {
    const router = useRouter()
    const pathname = usePathname()
    const [showExpiredModal, setShowExpiredModal] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    useEffect(() => {
        // Function to handle unauthorized access
        const handleUnauthorized = (event: CustomEvent) => {
            const adminSession = event.detail?.isAdmin || pathname.startsWith('/admin');
            setIsAdmin(adminSession)
            setShowExpiredModal(true)
        }

        // Add event listener for custom 'auth-unauthorized' event
        window.addEventListener('auth-unauthorized' as any, handleUnauthorized)

        // Intercept fetch to detect 401 errors
        const originalFetch = window.fetch
        window.fetch = async (...args) => {
            try {
                const response = await originalFetch(...args)

                if (response.status === 401) {
                    // Safely extract URL for debugging/logic
                    let url = ""
                    if (typeof args[0] === 'string') {
                        url = args[0]
                    } else if (args[0] instanceof URL) {
                        url = args[0].href
                    } else if (args[0] && (args[0] as any).url) {
                        url = (args[0] as any).url
                    }

                    // Check if it's an auth request to avoid infinite loops
                    if (url && !url.includes('/login') && !url.includes('/register') && !url.includes('/profile')) {
                        window.dispatchEvent(new CustomEvent('auth-unauthorized', {
                            detail: { isAdmin: url.includes('/admin') || pathname.startsWith('/admin') }
                        }))
                    }
                }

                return response
            } catch (error) {
                return Promise.reject(error)
            }
        }

        return () => {
            window.removeEventListener('auth-unauthorized' as any, handleUnauthorized)
            window.fetch = originalFetch
        }
    }, [router, pathname])

    const handleLogout = () => {
        if (isAdmin) {
            localStorage.removeItem("nepo_admin_token")
            localStorage.removeItem("nepo_admin_user")
            router.push("/admin-login")
        } else {
            localStorage.removeItem("nepo_token")
            localStorage.removeItem("nepo_user")
            router.push("/")
        }
        setShowExpiredModal(false)
    }

    if (!showExpiredModal) return null

    return (
        <>
            {/* Backdrop */}
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9998]" />

            {/* Modal */}
            <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4">
                <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 animate-in fade-in zoom-in duration-300">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                            <AlertCircle className="w-8 h-8 text-red-600" />
                        </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
                        Session Expired
                    </h2>

                    {/* Description */}
                    <p className="text-gray-600 text-center mb-8">
                        {isAdmin
                            ? "Your admin session has expired. Please log in again to continue."
                            : "Your session has expired. Please log in again to continue."
                        }
                    </p>

                    {/* Logout Button */}
                    <button
                        onClick={handleLogout}
                        className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    >
                        <LogOut className="w-5 h-5" />
                        Logout
                    </button>
                </div>
            </div>
        </>
    )
}