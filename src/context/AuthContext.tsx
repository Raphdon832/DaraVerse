// src/context/AuthContext.tsx
// Provides Firebase auth state to the entire app.
// Handles auth state changes, loading screen, and exposes
// the current Firebase user + helpers.

import {
    createContext,
    useContext,
    useEffect,
    useState,
    type ReactNode,
} from "react";
import type { User } from "firebase/auth";

import { onAuthChanged } from "../services/authService";
import { ensureUserRoleOnAuth } from "../services/userService";

type AuthContextValue = {
    /** The currently signed-in Firebase user, or null if signed out. */
    user: User | null;
    /** True while we are waiting for the initial auth state check. */
    isLoading: boolean;
    /** True if the current user is authenticated (anonymous or email). */
    isAuthenticated: boolean;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthChanged((firebaseUser) => {
            setUser(firebaseUser);
            setIsLoading(false);

            if (firebaseUser) {
                void ensureUserRoleOnAuth(firebaseUser.uid).catch((error) => {
                    console.error("Failed to ensure user role on auth:", error);
                });
            }
        });
        return unsubscribe;
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: user !== null,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used inside AuthProvider.");
    }
    return context;
}
