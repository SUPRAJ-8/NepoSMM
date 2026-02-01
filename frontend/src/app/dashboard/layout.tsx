import { Sidebar } from "@/components/dashboard/Sidebar";
import { WelcomeTour } from "@/components/dashboard/welcome-tour";
import { WhatsAppFloatButton } from "@/components/whatsapp-float-button";

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="min-h-screen bg-background text-foreground font-sans flex relative">
            <WelcomeTour />
            <Sidebar />
            <WhatsAppFloatButton />
            <div className="flex-1 lg:ml-64 flex flex-col min-w-0 transition-all duration-200">
                {/* content */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {children}
                </main>
            </div>
        </div>
    );
}
