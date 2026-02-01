"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

export function GoogleProvider({ children }: { children: React.ReactNode }) {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    console.log("Google Client ID loaded:", clientId ? "MATCH" : "MISSING");

    if (!clientId || clientId === "your_google_client_id_here") {
        return <>{children}</>;
    }

    return (
        <GoogleOAuthProvider clientId={clientId}>
            {children}
        </GoogleOAuthProvider>
    );
}
