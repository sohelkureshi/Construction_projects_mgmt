"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, type User } from "@/lib/api";
import { AppShell } from "./app-shell";
const UserContext = createContext<User | null>(null);
export const useCurrentUser = () => useContext(UserContext);
export function AuthGuard({ children }: { children: React.ReactNode }) { const router = useRouter(); const [user, setUser] = useState<User | null>(null); useEffect(() => { api<{ user: User }>("/api/auth/me").then(({ user }) => setUser(user)).catch(() => router.replace("/login")); }, [router]); if (!user) return <div className="page-loader">Loading workspace...</div>; return <UserContext.Provider value={user}><AppShell user={user}>{children}</AppShell></UserContext.Provider>; }
