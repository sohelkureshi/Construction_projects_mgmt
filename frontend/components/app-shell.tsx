"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { api, type User } from "@/lib/api";
const links = [{ href: "/dashboard", label: "Overview" }, { href: "/projects", label: "Projects" }];
export function AppShell({ user, children }: { user: User; children: React.ReactNode }) {
  const router = useRouter(); const pathname = usePathname();
  const logout = async () => { await api("/api/auth/logout", { method: "POST" }); router.replace("/login"); };
  const navigation = user.role === "admin" ? [...links, { href: "/admin/roles", label: "Roles" }] : links;
  return <div className="app-shell"><header className="topbar"><Link className="brand" href="/dashboard">SiteFrame<span>.</span></Link><nav>{navigation.map((link) => <Link key={link.href} className={pathname.startsWith(link.href) ? "active" : ""} href={link.href}>{link.label}</Link>)}</nav><div className="user-menu"><span><b>{user.name}</b><small>{user.role.replace("-", " ")}</small></span><button className="quiet-button" onClick={logout}>Sign out</button></div></header><main className="workspace">{children}</main></div>;
}
