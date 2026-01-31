"use client";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import { CurrencyProvider } from "@/context/CurrencyContext";
import { DashboardCurrencyProvider } from "@/context/DashboardCurrencyContext";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const router = useRouter();
    const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const adminToken = localStorage.getItem("nepo_admin_token");
        const adminUser = localStorage.getItem("nepo_admin_user");

        if (!adminToken || !adminUser) {
            router.push("/admin-login");
        } else {
            setIsAuthorized(true);
        }
    }, [router]);

    if (isAuthorized === null) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center">
                <div className="h-8 w-8 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <CurrencyProvider>
            <DashboardCurrencyProvider>
                <div className="min-h-screen bg-[#0b1021] text-white font-sans flex overflow-hidden">
                    <AdminSidebar />
                    <div className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
                        <AdminTopbar />
                        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                            {children}
                        </main>
                    </div>
                </div>
            </DashboardCurrencyProvider>
        </CurrencyProvider>
    );
}