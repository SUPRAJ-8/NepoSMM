"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Sparkles, Zap, MessageCircle, ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useContactLinks } from "@/contexts/ContactLinksContext";

export function LoginBonusPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const router = useRouter();
    const { contactLinks } = useContactLinks();

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem("nepo_token");
        if (!token) return;

        // Check if popup has been shown in this session
        const hasShown = sessionStorage.getItem("nepo_login_popup_shown");

        if (!hasShown) {
            // Delay showing the popup for a smoother experience
            const timer = setTimeout(() => {
                setIsOpen(true);
                sessionStorage.setItem("nepo_login_popup_shown", "true");
            }, 1500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAddFunds = () => {
        setIsOpen(false);
        router.push("/add-funds");
    };

    const handleSupport = () => {
        if (contactLinks.whatsapp_number) {
            window.open(`https://wa.me/${contactLinks.whatsapp_number}`, '_blank');
        } else {
            router.push("/tickets");
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border-none bg-transparent shadow-2xl">
                <div className="relative bg-[#020617] text-white">
                    {/* Decorative Background Elements */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-primary/20 blur-[100px] rounded-full" />
                        <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-purple-500/20 blur-[100px] rounded-full" />
                    </div>

                    {/* Content Section */}
                    <div className="relative z-10">
                        {/* Image Header */}
                        <div className="h-56 w-full relative group">
                            <img
                                src="/fonepay_bonus_promo.png"
                                alt="Bonus Offer"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent" />

                            {/* Floating Badge */}
                            <motion.div
                                initial={{ scale: 0, rotate: -15 }}
                                animate={{ scale: 1, rotate: -5 }}
                                transition={{ type: "spring", damping: 12, delay: 0.5 }}
                                className="absolute top-6 left-6 bg-gradient-to-r from-amber-400 to-orange-500 p-3 rounded-2xl shadow-2xl transform -rotate-6"
                            >
                                <div className="text-center">
                                    <span className="block text-2xl font-black text-white leading-none">5%</span>
                                    <span className="block text-[10px] font-bold text-white uppercase tracking-tighter">Bonus</span>
                                </div>
                            </motion.div>
                        </div>

                        <div className="p-8 pt-2">
                            <DialogHeader>
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                                        <Sparkles className="h-5 w-5 text-primary" />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-[0.2em] text-primary">Limited Time Offer</span>
                                </div>
                                <DialogTitle className="text-3xl font-black tracking-tight mb-2 text-white">
                                    Boost Your Balance!
                                </DialogTitle>
                                <DialogDescription className="text-gray-400 text-base leading-relaxed">
                                    Get an exclusive <span className="text-white font-bold">5% instant bonus</span> when you add funds using <span className="text-blue-400 font-bold">Fonepay</span>. Don't miss out on this limited reward!
                                </DialogDescription>
                            </DialogHeader>

                            <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <Button
                                    onClick={handleAddFunds}
                                    className="h-14 rounded-2xl bg-primary hover:bg-blue-600 text-white font-black text-lg transition-all active:scale-95 group shadow-[0_10px_30px_-10px_rgba(37,99,235,0.5)]"
                                >
                                    <Zap className="mr-2 h-5 w-5 fill-white" />
                                    <span>Add Funds</span>
                                    <ArrowRight className="ml-2 h-5 w-5 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                                </Button>

                                <Button
                                    onClick={handleSupport}
                                    variant="outline"
                                    className="h-14 rounded-2xl border-white/10 bg-white/5 hover:bg-white/10 text-white font-bold text-lg transition-all active:scale-95 flex items-center justify-center gap-2"
                                >
                                    <MessageCircle className="h-5 w-5 text-emerald-400" />
                                    <span>Contact Support</span>
                                </Button>
                            </div>

                            <p className="mt-6 text-center text-[10px] text-gray-500 uppercase font-bold tracking-widest">
                                * Terms and conditions apply
                            </p>
                        </div>
                    </div>

                    {/* Close Button - Custom Overwrite */}
                    <button
                        onClick={() => setIsOpen(false)}
                        className="absolute top-4 right-4 z-50 h-10 w-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md text-white/70 hover:text-white hover:bg-black/60 transition-all border border-white/10"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
