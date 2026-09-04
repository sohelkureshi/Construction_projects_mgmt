import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = { title: "SiteFrame | Construction management", description: "Clear, practical construction project management." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
