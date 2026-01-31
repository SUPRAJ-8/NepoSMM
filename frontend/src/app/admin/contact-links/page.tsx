"use client";

import { API_URL } from '@/lib/api-config'


import React, { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { toast } from "sonner"
import { Phone, MessageCircle, MessageSquare, Save } from "lucide-react"

export default function ContactLinksPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [isSaving, setIsSaving] = useState(false)
    const [contactData, setContactData] = useState({
        whatsapp_number: "",
        tawk_token: "",
        telegram_username: ""
    })

    useEffect(() => {
        fetchContactLinks()
    }, [])

    const fetchContactLinks = async () => {
        setIsLoading(true)
        try {
            const token = localStorage.getItem("nepo_admin_token")
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '${API_URL}';
            const response = await fetch(`${apiUrl}/settings/contact-links`, {
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Fetch failed:", errorData);
                throw new Error("Failed to fetch contact links")
            }

            const data = await response.json()
            setContactData({
                whatsapp_number: data.whatsapp_number || "",
                tawk_token: data.tawk_token || "",
                telegram_username: data.telegram_username || ""
            })
        } catch (error: any) {
            console.error("Error fetching contact links:", error)
            toast.error("Failed to load contact links")
        } finally {
            setIsLoading(false)
        }
    }

    const handleSave = async () => {
        setIsSaving(true)
        try {
            const token = localStorage.getItem("nepo_admin_token")
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || '${API_URL}';
            const response = await fetch(`${apiUrl}/settings/contact-links`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(contactData)
            })

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                console.error("Save failed:", errorData);
                throw new Error("Failed to save contact links")
            }

            toast.success("Contact links updated successfully!")
        } catch (error: any) {
            console.error("Error saving contact links:", error)
            toast.error("Failed to save contact links")
        } finally {
            setIsSaving(false)
        }
    }

    const handleInputChange = (field: string, value: string) => {
        setContactData(prev => ({
            ...prev,
            [field]: value
        }))
    }

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-muted-foreground">Loading contact links...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Contact Links</h1>
                <p className="text-muted-foreground mt-2">
                    Manage your contact and support integration settings
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                {/* WhatsApp */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                                <Phone className="h-5 w-5 text-green-500" />
                            </div>
                            <div>
                                <CardTitle>WhatsApp Number</CardTitle>
                                <CardDescription>Customer support WhatsApp number</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp">WhatsApp Number (with country code)</Label>
                            <Input
                                id="whatsapp"
                                placeholder="e.g., 9779866887714"
                                value={contactData.whatsapp_number}
                                onChange={(e) => handleInputChange("whatsapp_number", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter the number without + or spaces (e.g., 9779866887714 for Nepal)
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Tawk.to */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                                <MessageCircle className="h-5 w-5 text-blue-500" />
                            </div>
                            <div>
                                <CardTitle>Tawk.to Token</CardTitle>
                                <CardDescription>Live chat widget integration</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="tawk">Tawk.to Property ID</Label>
                            <Input
                                id="tawk"
                                placeholder="e.g., 5f8a9b7c8d9e0f1234567890"
                                value={contactData.tawk_token}
                                onChange={(e) => handleInputChange("tawk_token", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Find your Property ID in Tawk.to Dashboard → Administration → Property Settings
                            </p>
                        </div>
                    </CardContent>
                </Card>

                {/* Telegram */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-sky-500/10 flex items-center justify-center">
                                <MessageSquare className="h-5 w-5 text-sky-500" />
                            </div>
                            <div>
                                <CardTitle>Telegram Username</CardTitle>
                                <CardDescription>Support channel or bot username</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-2">
                            <Label htmlFor="telegram">Telegram Username</Label>
                            <Input
                                id="telegram"
                                placeholder="e.g., neposmm_support"
                                value={contactData.telegram_username}
                                onChange={(e) => handleInputChange("telegram_username", e.target.value)}
                            />
                            <p className="text-xs text-muted-foreground">
                                Enter username without @ symbol
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Save Button */}
            <div className="flex justify-end">
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    size="lg"
                    className="gap-2"
                >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                </Button>
            </div>

            {/* Preview Section */}
            <Card>
                <CardHeader>
                    <CardTitle>Preview</CardTitle>
                    <CardDescription>How your contact links will appear</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {contactData.whatsapp_number && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                                <Phone className="h-5 w-5 text-green-500" />
                                <div>
                                    <p className="font-medium">WhatsApp</p>
                                    <a
                                        href={`https://wa.me/${contactData.whatsapp_number}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        +{contactData.whatsapp_number}
                                    </a>
                                </div>
                            </div>
                        )}
                        {contactData.telegram_username && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                                <MessageSquare className="h-5 w-5 text-sky-500" />
                                <div>
                                    <p className="font-medium">Telegram</p>
                                    <a
                                        href={`https://t.me/${contactData.telegram_username}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-primary hover:underline"
                                    >
                                        @{contactData.telegram_username}
                                    </a>
                                </div>
                            </div>
                        )}
                        {contactData.tawk_token && (
                            <div className="flex items-center gap-3 p-3 rounded-lg bg-muted">
                                <MessageCircle className="h-5 w-5 text-blue-500" />
                                <div>
                                    <p className="font-medium">Tawk.to Live Chat</p>
                                    <p className="text-sm text-muted-foreground">
                                        Widget will be embedded on the site
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}