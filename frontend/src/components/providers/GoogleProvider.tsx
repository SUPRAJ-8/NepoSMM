"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export function GoogleProvider({ children }: { children: React.ReactNode }) {
    const rawClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
    const clientId = rawClientId.trim();
    const isReady = clientId && clientId !== "your_google_client_id_here" && clientId !== "dummy-id";

    console.log("Google Client ID status:", isReady ? "READY" : "NOT_CONFIGURED");
    if (!isReady) {
        console.warn("Google Client ID is missing or invalid. Google Login will not work.");
    }

    return (
        <GoogleOAuthProvider clientId={isReady ? clientId : "dummy-id"}>
            {children}
        </GoogleOAuthProvider>
    );
}
