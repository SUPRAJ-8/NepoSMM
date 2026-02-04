"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export function GoogleProvider({ children }: { children: React.ReactNode }) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "";
    const isReady = clientId && clientId !== "your_google_client_id_here";

    console.log("Google Client ID status:", isReady ? "READY" : "MISSING/DEFAULT");

    return (
        <GoogleOAuthProvider clientId={isReady ? clientId : "dummy-id"}>
            {children}
        </GoogleOAuthProvider>
    );
}
