"use client";

import { API_URL } from '@/lib/api-config'


import { useState, useEffect, Suspense } from "react"
import { AdminSidebar } from "@/components/admin/AdminSidebar"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    MessageSquare,
    Search,
    Clock,
    ChevronRight,
    Send,
    User,
    Shield,
    Filter
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface Ticket {
    id: number
    user_id: number
    username: string
    email: string
    subject: string
    status: string
    category: string
    created_at: string
    updated_at: string
}

interface Message {
    id: number
    message: string
    sender_name: string
    is_admin: boolean
    created_at: string
}

function AdminSupportContent() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)

    const fetchAllTickets = async () => {
        try {
            const token = localStorage.getItem("nepo_admin_token")
            const response = await fetch(`${API_URL}/tickets/admin/all`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setTickets(data)
            }
        } catch (error) {
            console.error("Error fetching admin tickets:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async (ticketId: number) => {
        try {
            const token = localStorage.getItem("nepo_admin_token")
            const response = await fetch(`${API_URL}/tickets/${ticketId}`, {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setMessages(data.messages)
                setSelectedTicket(data.ticket)
            }
        } catch (error) {
            console.error("Error fetching messages:", error)
        }
    }

    useEffect(() => {
        fetchAllTickets()
    }, [])

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedTicket) return

        setIsSending(true)
        try {
            const token = localStorage.getItem("nepo_admin_token")
            const response = await fetch(`${API_URL}/tickets/${selectedTicket.id}/messages`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ message: newMessage })
            })

            if (response.ok) {
                setNewMessage("")
                fetchMessages(selectedTicket.id)
                fetchAllTickets() // Refresh status in list
            } else {
                toast.error("Failed to send message")
            }
        } catch (error) {
            toast.error("An error occurred")
        } finally {
            setIsSending(false)
        }
    }

    const handleCloseTicket = async () => {
        if (!selectedTicket) return
        try {
            const token = localStorage.getItem("nepo_admin_token")
            const response = await fetch(`${API_URL}/tickets/${selectedTicket.id}/close`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (response.ok) {
                toast.success("Ticket closed")
                fetchAllTickets()
                fetchMessages(selectedTicket.id)
            } else {
                toast.error("Failed to close ticket")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status.toLowerCase()) {
            case "open":
                return <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">Open</Badge>
            case "pending":
                return <Badge variant="outline" className="bg-amber-500/10 text-amber-500 border-amber-500/20">Pending</Badge>
            case "answered":
                return <Badge variant="outline" className="bg-blue-500/10 text-blue-500 border-blue-500/20">Answered</Badge>
            case "closed":
                return <Badge variant="outline" className="bg-slate-500/10 text-slate-500 border-slate-500/20">Closed</Badge>
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    return (
        <div className="min-h-screen bg-[#06080c] text-white">
            <AdminSidebar />
            <div className="lg:pl-64 flex flex-col min-h-screen">
                <Header title="Ticket Management" />
                <main className="flex-1 p-4 lg:p-8 space-y-8 max-w-[1600px] mx-auto w-full">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight text-white">Support Tickets</h1>
                            <p className="text-gray-400">Manage and respond to user requests.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-250px)]">
                        {/* Tickets List */}
                        <div className={cn(
                            "lg:col-span-4 space-y-4 flex flex-col h-full",
                            selectedTicket ? "hidden lg:flex" : "lg:col-span-12 xl:col-span-12"
                        )}>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                                    <Input placeholder="Search user or subject..." className="pl-10 rounded-xl border-white/10 bg-white/5 h-12" />
                                </div>
                                <Button variant="outline" className="rounded-xl border-white/10 bg-white/5 h-12">
                                    <Filter className="h-5 w-5" />
                                </Button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-white/10">
                                {loading ? (
                                    Array(5).fill(0).map((_, i) => (
                                        <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
                                    ))
                                ) : (
                                    tickets.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            onClick={() => fetchMessages(ticket.id)}
                                            className={cn(
                                                "p-5 rounded-2xl border transition-all cursor-pointer group",
                                                selectedTicket?.id === ticket.id
                                                    ? "bg-purple-500/10 border-purple-500/50 shadow-xl shadow-purple-500/5"
                                                    : "bg-white/[0.02] border-white/5 hover:border-white/20 hover:bg-white/[0.04]"
                                            )}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-bold text-white truncate pr-2">{ticket.subject}</h3>
                                                    <p className="text-xs text-gray-500 font-medium">From: <span className="text-gray-300">@{ticket.username}</span></p>
                                                </div>
                                                {getStatusBadge(ticket.status)}
                                            </div>
                                            <div className="flex items-center justify-between text-[10px] text-gray-500 font-bold uppercase tracking-wider">
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-white/5 px-2 py-0.5 rounded text-gray-400">{ticket.category}</span>
                                                    <span>#{ticket.id}</span>
                                                </div>
                                                <div className="flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />
                                                    {new Date(ticket.updated_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

                        {/* Ticket View */}
                        <div className={cn(
                            "lg:col-span-8 flex flex-col h-full",
                            !selectedTicket && "hidden lg:flex"
                        )}>
                            <Card className="flex-1 flex flex-col border-white/10 overflow-hidden bg-white/[0.02] backdrop-blur-3xl rounded-3xl">
                                {selectedTicket ? (
                                    <>
                                        <CardHeader className="border-b border-white/10 bg-white/[0.02] p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="lg:hidden text-gray-400"
                                                        onClick={() => setSelectedTicket(null)}
                                                    >
                                                        <ChevronRight className="h-5 w-5 rotate-180" />
                                                    </Button>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <CardTitle className="text-xl font-black text-white">{selectedTicket.subject}</CardTitle>
                                                            {getStatusBadge(selectedTicket.status)}
                                                        </div>
                                                        <CardDescription className="flex items-center gap-3 text-gray-500">
                                                            <span className="font-bold text-purple-400 italic">#{selectedTicket.id}</span>
                                                            <span className="h-1 w-1 rounded-full bg-gray-700" />
                                                            <span>User: <span className="text-gray-300">{selectedTicket.username}</span> ({selectedTicket.email})</span>
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {selectedTicket.status !== 'closed' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-xl border-white/10 bg-white/5 hover:bg-red-500/10 hover:text-red-400 hover:border-red-500/20"
                                                            onClick={handleCloseTicket}
                                                        >
                                                            Close Ticket
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-white/10">
                                            <AnimatePresence mode="popLayout">
                                                {messages.map((msg, idx) => (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        key={msg.id}
                                                        className={cn(
                                                            "flex flex-col max-w-[85%] space-y-2",
                                                            msg.is_admin ? "ml-auto items-end" : "mr-auto"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "flex items-center gap-2 px-1",
                                                            msg.is_admin ? "flex-row-reverse" : "flex-row"
                                                        )}>
                                                            <div className={cn(
                                                                "h-6 w-6 rounded-full flex items-center justify-center",
                                                                msg.is_admin ? "bg-purple-500 text-white" : "bg-white/10"
                                                            )}>
                                                                {msg.is_admin ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                                            </div>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-500">
                                                                {msg.is_admin ? "You (Admin)" : msg.sender_name}
                                                            </span>
                                                            <span className="text-[10px] text-gray-600">
                                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div className={cn(
                                                            "p-4 rounded-2xl text-sm leading-relaxed border",
                                                            msg.is_admin
                                                                ? "bg-purple-600 text-white border-purple-500 rounded-tr-none shadow-lg shadow-purple-900/20"
                                                                : "bg-white/5 text-gray-200 border-white/10 rounded-tl-none"
                                                        )}>
                                                            {msg.message}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </CardContent>
                                        <div className="p-6 border-t border-white/10 bg-white/[0.01]">
                                            {selectedTicket.status === 'closed' ? (
                                                <div className="bg-white/5 p-4 rounded-xl text-center text-sm font-medium text-gray-500 uppercase tracking-widest border border-dashed border-white/10">
                                                    This ticket has been closed
                                                </div>
                                            ) : (
                                                <form onSubmit={handleSendMessage} className="flex gap-3">
                                                    <Input
                                                        placeholder="Type your response..."
                                                        className="flex-1 rounded-xl border-white/10 bg-white/5 h-12 text-white"
                                                        value={newMessage}
                                                        onChange={(e) => setNewMessage(e.target.value)}
                                                        disabled={isSending}
                                                    />
                                                    <Button
                                                        type="submit"
                                                        className="rounded-xl px-6 h-12 bg-purple-600 hover:bg-purple-700 text-white font-bold"
                                                        disabled={isSending || !newMessage.trim()}
                                                    >
                                                        <Send className="h-5 w-5" />
                                                    </Button>
                                                </form>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center opacity-50">
                                        <div className="h-24 w-24 rounded-3xl bg-white/5 flex items-center justify-center mb-6 rotate-12">
                                            <MessageSquare className="h-10 w-10 text-white/20" />
                                        </div>
                                        <h3 className="text-2xl font-black text-white mb-2">Select a Ticket</h3>
                                        <p className="text-gray-500 max-w-sm">
                                            Click on a ticket from the left sidebar to view details and respond.
                                        </p>
                                    </div>
                                )}
                            </Card>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    )
}

export default function AdminSupportPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#06080c] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-500"></div>
            </div>
        }>
            <AdminSupportContent />
        </Suspense>
    )
}