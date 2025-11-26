import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";
import type { ReactNode } from "react";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
    return (
        <>
            <SignedIn>
                {children}
            </SignedIn>
            <SignedOut>
                <RedirectToSignIn />
            </SignedOut>
        </>
    );
}
