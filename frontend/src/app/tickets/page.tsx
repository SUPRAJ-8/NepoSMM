"use client";

import { API_URL } from '@/lib/api-config'


import { useState, useEffect, Suspense } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { WelcomeTour } from "@/components/dashboard/welcome-tour"
import { Header } from "@/components/header"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import {
    MessageSquare,
    Plus,
    Search,
    Clock,
    CheckCircle2,
    AlertCircle,
    ChevronRight,
    Send,
    User,
    Shield
} from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface Ticket {
    id: number
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

function TicketsContent() {
    const [tickets, setTickets] = useState<Ticket[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [isSending, setIsSending] = useState(false)

    // Form states
    const [subject, setSubject] = useState("")
    const [category, setCategory] = useState("general")
    const [message, setMessage] = useState("")

    const fetchTickets = async () => {
        try {
            const token = localStorage.getItem("nepo_token")
            const response = await fetch("${API_URL}/tickets", {
                headers: { "Authorization": `Bearer ${token}` }
            })
            if (response.ok) {
                const data = await response.json()
                setTickets(data)
            }
        } catch (error) {
            console.error("Error fetching tickets:", error)
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async (ticketId: number) => {
        try {
            const token = localStorage.getItem("nepo_token")
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
        fetchTickets()
    }, [])

    const handleCreateTicket = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!subject || !message) {
            toast.error("Please fill in all fields")
            return
        }

        try {
            const token = localStorage.getItem("nepo_token")
            const response = await fetch("${API_URL}/tickets", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ subject, category, message })
            })

            if (response.ok) {
                toast.success("Ticket created successfully")
                setIsCreateOpen(false)
                setSubject("")
                setMessage("")
                fetchTickets()
            } else {
                toast.error("Failed to create ticket")
            }
        } catch (error) {
            toast.error("An error occurred")
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newMessage.trim() || !selectedTicket) return

        setIsSending(true)
        try {
            const token = localStorage.getItem("nepo_token")
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
            const token = localStorage.getItem("nepo_token")
            const response = await fetch(`${API_URL}/tickets/${selectedTicket.id}/close`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${token}` }
            })

            if (response.ok) {
                toast.success("Ticket closed")
                fetchTickets()
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
        <div className="min-h-screen bg-background text-foreground">
            <WelcomeTour />
            <Sidebar />
            <div className="lg:pl-64 flex flex-col min-h-screen">
                <Header title="Support Tickets" />
                <main className="flex-1 p-4 lg:p-8 space-y-8 max-w-7xl mx-auto w-full">

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-black tracking-tight">Support Center</h1>
                            <p className="text-muted-foreground">Need help? Create a ticket and our team will assist you.</p>
                        </div>
                        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                            <DialogTrigger asChild>
                                <Button className="rounded-xl px-6 h-12 font-bold shadow-lg shadow-primary/20">
                                    <Plus className="h-5 w-5 mr-2" />
                                    New Ticket
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] border-2">
                                <form onSubmit={handleCreateTicket}>
                                    <DialogHeader>
                                        <DialogTitle className="text-2xl font-black">Create New Ticket</DialogTitle>
                                        <DialogDescription>
                                            Tell us what you need help with. We'll get back to you soon.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-6 py-6">
                                        <div className="grid gap-2">
                                            <Label htmlFor="subject" className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Subject</Label>
                                            <Input
                                                id="subject"
                                                placeholder="Brief description of the issue"
                                                className="rounded-xl border-2"
                                                value={subject}
                                                onChange={(e) => setSubject(e.target.value)}
                                            />
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="category" className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Category</Label>
                                            <Select value={category} onValueChange={setCategory}>
                                                <SelectTrigger className="rounded-xl border-2">
                                                    <SelectValue placeholder="Select a category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="order">Order Issues</SelectItem>
                                                    <SelectItem value="payment">Payment Problems</SelectItem>
                                                    <SelectItem value="service">Service Questions</SelectItem>
                                                    <SelectItem value="general">General Inquiry</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="message" className="font-bold uppercase text-[10px] tracking-widest text-muted-foreground">Message</Label>
                                            <Textarea
                                                id="message"
                                                placeholder="Detailed description of your request..."
                                                className="min-h-[150px] rounded-xl border-2 resize-none"
                                                value={message}
                                                onChange={(e) => setMessage(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button type="submit" className="w-full rounded-xl py-6 font-bold text-lg">Submit Ticket</Button>
                                    </DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                        {/* Tickets List */}
                        <div className={cn(
                            "lg:col-span-4 space-y-4 transition-all duration-300",
                            selectedTicket ? "hidden lg:block" : "lg:col-span-12 xl:col-span-12"
                        )}>
                            <div className="relative mb-6">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input placeholder="Search tickets..." className="pl-10 rounded-xl border-2 bg-card" />
                            </div>

                            <div className="space-y-3">
                                {loading ? (
                                    Array(3).fill(0).map((_, i) => (
                                        <div key={i} className="h-24 rounded-2xl bg-muted animate-pulse" />
                                    ))
                                ) : tickets.length === 0 ? (
                                    <div className="text-center py-20 bg-card rounded-3xl border-2 border-dashed flex flex-col items-center">
                                        <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                                            <MessageSquare className="h-8 w-8 text-primary" />
                                        </div>
                                        <h3 className="text-xl font-bold">No tickets yet</h3>
                                        <p className="text-muted-foreground max-w-xs mx-auto mt-2">
                                            You haven't created any support tickets. If you need help, click the button above.
                                        </p>
                                    </div>
                                ) : (
                                    tickets.map((ticket) => (
                                        <div
                                            key={ticket.id}
                                            onClick={() => fetchMessages(ticket.id)}
                                            className={cn(
                                                "p-5 rounded-2xl border-2 cursor-pointer transition-all hover:border-primary/50 group",
                                                selectedTicket?.id === ticket.id
                                                    ? "bg-primary/5 border-primary shadow-xl shadow-primary/5"
                                                    : "bg-card border-border hover:bg-muted/30"
                                            )}
                                        >
                                            <div className="flex items-start justify-between mb-2">
                                                <h3 className="font-bold flex-1 truncate mr-2">{ticket.subject}</h3>
                                                {getStatusBadge(ticket.status)}
                                            </div>
                                            <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-muted px-2 py-0.5 rounded capitalize">{ticket.category}</span>
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
                            "lg:col-span-8 flex flex-col min-h-[600px] transition-all duration-300",
                            !selectedTicket && "hidden lg:flex"
                        )}>
                            <Card className="flex-1 flex flex-col border-2 overflow-hidden bg-card/40 backdrop-blur-md">
                                {selectedTicket ? (
                                    <>
                                        <CardHeader className="border-b-2 bg-card p-6">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="lg:hidden"
                                                        onClick={() => setSelectedTicket(null)}
                                                    >
                                                        <ChevronRight className="h-5 w-5 rotate-180" />
                                                    </Button>
                                                    <div>
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <CardTitle className="text-xl font-black">{selectedTicket.subject}</CardTitle>
                                                            {getStatusBadge(selectedTicket.status)}
                                                        </div>
                                                        <CardDescription className="flex items-center gap-3">
                                                            <span className="font-bold text-primary italic">#{selectedTicket.id}</span>
                                                            <span className="h-1 w-1 rounded-full bg-muted-foreground" />
                                                            <span>Created on {new Date(selectedTicket.created_at).toLocaleString()}</span>
                                                        </CardDescription>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {selectedTicket.status !== 'closed' && (
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            className="rounded-xl border-2"
                                                            onClick={handleCloseTicket}
                                                        >
                                                            Close Ticket
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 overflow-y-auto p-6 space-y-6 max-h-[500px]">
                                            <AnimatePresence mode="popLayout">
                                                {messages.map((msg, idx) => (
                                                    <motion.div
                                                        initial={{ opacity: 0, y: 10 }}
                                                        animate={{ opacity: 1, y: 0 }}
                                                        key={msg.id}
                                                        className={cn(
                                                            "flex flex-col max-w-[85%] space-y-2",
                                                            msg.is_admin ? "mr-auto" : "ml-auto items-end"
                                                        )}
                                                    >
                                                        <div className={cn(
                                                            "flex items-center gap-2 px-1",
                                                            msg.is_admin ? "flex-row" : "flex-row-reverse"
                                                        )}>
                                                            <div className={cn(
                                                                "h-6 w-6 rounded-full flex items-center justify-center",
                                                                msg.is_admin ? "bg-primary text-primary-foreground" : "bg-muted"
                                                            )}>
                                                                {msg.is_admin ? <Shield className="h-3 w-3" /> : <User className="h-3 w-3" />}
                                                            </div>
                                                            <span className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                                                                {msg.is_admin ? "Support Team" : "You"}
                                                            </span>
                                                            <span className="text-[10px] text-muted-foreground/50">
                                                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div className={cn(
                                                            "p-4 rounded-2xl text-sm leading-relaxed border-2",
                                                            msg.is_admin
                                                                ? "bg-card border-border rounded-tl-none shadow-sm"
                                                                : "bg-primary text-primary-foreground border-primary rounded-tr-none shadow-lg shadow-primary/10"
                                                        )}>
                                                            {msg.message}
                                                        </div>
                                                    </motion.div>
                                                ))}
                                            </AnimatePresence>
                                        </CardContent>
                                        <div className="p-6 border-t-2 bg-card">
                                            {selectedTicket.status === 'closed' ? (
                                                <div className="bg-muted/50 p-4 rounded-xl text-center text-sm font-medium text-muted-foreground uppercase tracking-widest border-2 border-dashed">
                                                    This ticket has been closed
                                                </div>
                                            ) : (
                                                <form onSubmit={handleSendMessage} className="flex gap-3">
                                                    <Input
                                                        placeholder="Type your message..."
                                                        className="flex-1 rounded-xl border-2 h-12"
                                                        value={newMessage}
                                                        onChange={(e) => setNewMessage(e.target.value)}
                                                        disabled={isSending}
                                                    />
                                                    <Button
                                                        type="submit"
                                                        className="rounded-xl px-6 h-12"
                                                        disabled={isSending || !newMessage.trim()}
                                                    >
                                                        <Send className="h-5 w-5" />
                                                    </Button>
                                                </form>
                                            )}
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
                                        <div className="h-20 w-20 rounded-3xl bg-primary/5 flex items-center justify-center mb-6 rotate-12 group-hover:rotate-0 transition-transform">
                                            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                                                <MessageSquare className="h-8 w-8 text-primary" />
                                            </div>
                                        </div>
                                        <h3 className="text-2xl font-black mb-2">Select a Ticket</h3>
                                        <p className="text-muted-foreground max-w-sm mb-8">
                                            Choose a ticket from the list to view its conversation history or start a new one.
                                        </p>
                                        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
                                            <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-left">
                                                <Clock className="h-5 w-5 text-primary mb-2" />
                                                <p className="text-xs font-bold uppercase tracking-wider mb-1">Response Time</p>
                                                <p className="text-sm font-medium text-muted-foreground">Average 2-4 hours</p>
                                            </div>
                                            <div className="p-4 rounded-2xl bg-muted/30 border border-border/50 text-left">
                                                <Shield className="h-5 w-5 text-emerald-500 mb-2" />
                                                <p className="text-xs font-bold uppercase tracking-wider mb-1">Support Status</p>
                                                <p className="text-sm font-medium text-muted-foreground">Team Online</p>
                                            </div>
                                        </div>
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

export default function TicketsPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        }>
            <TicketsContent />
        </Suspense>
    )
}