"use client"

import React, { createContext, useContext, useEffect, useState } from "react"

interface ContactLinks {
    whatsapp_number: string
    tawk_token: string
    telegram_username: string
}

interface ContactLinksContextType {
    contactLinks: ContactLinks
    isLoading: boolean
}

const ContactLinksContext = createContext<ContactLinksContextType | undefined>(undefined)

export function ContactLinksProvider({ children }: { children: React.ReactNode }) {
    const [contactLinks, setContactLinks] = useState<ContactLinks>({
        whatsapp_number: "",
        tawk_token: "",
        telegram_username: ""
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        const fetchContactLinks = async () => {
            try {
                // Determine the correct API base URL
                const backendUrl = (process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
                const apiUrl = `${backendUrl}/api`;

                const response = await fetch(`${apiUrl}/settings/public-contact-links`)
                if (response.ok) {
                    const data = await response.json()
                    setContactLinks(data)
                }
            } catch (error) {
                console.error("Failed to fetch contact links:", error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchContactLinks()
    }, [])

    // Initialize Tawk.to when token is available
    useEffect(() => {
        if (contactLinks.tawk_token && typeof window !== 'undefined') {
            // Check if Tawk.to is already loaded
            if ((window as any).Tawk_API) return;

            var Tawk_API: any = Tawk_API || {}, Tawk_LoadStart = new Date();
            (function () {
                var s1 = document.createElement("script"), s0 = document.getElementsByTagName("script")[0];
                s1.async = true;
                s1.src = `https://embed.tawk.to/${contactLinks.tawk_token}/default`;
                s1.charset = 'UTF-8';
                s1.setAttribute('crossorigin', '*');
                if (s0 && s0.parentNode) {
                    s0.parentNode.insertBefore(s1, s0);
                } else {
                    document.head.appendChild(s1);
                }
            })();

            // Clean up function not normally needed for Tawk.to script injection 
            // as it persists across navigation in SPA, but good to be aware
        }
    }, [contactLinks.tawk_token]);

    return (
        <ContactLinksContext.Provider value={{ contactLinks, isLoading }}>
            {children}
        </ContactLinksContext.Provider>
    )
}

export function useContactLinks() {
    const context = useContext(ContactLinksContext)
    if (context === undefined) {
        throw new Error("useContactLinks must be used within a ContactLinksProvider")
    }
    return context
}
