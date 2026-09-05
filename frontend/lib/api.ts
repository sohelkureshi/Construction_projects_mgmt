const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
export type User = { _id: string; name: string; email: string; role: string; approved: boolean };
export type Project = { _id: string; title: string; supervisor: string; company: string; overview: string; location: string; duration: string; status: string; startDate?: string; expectedDate?: string; progresses?: Progress[]; bills?: Bill[]; comments?: Comment[]; drawings?: Document[]; tenders?: Document[] };
export type Progress = { _id: string; task: string; initial_date: string; final_date: string; percentage: number; completed: boolean; description: string; image: { url: string }[] };
export type Bill = { _id: string; Bill_Name: string; date: string; total_amount: number; bill_type?: string; certification_status?: string; notes?: string; items: { item_id?: number; name: string; category?: string; standard?: string; description?: string; quantity: number; units: string; rate: number; amount: number }[] };
export type Comment = { _id: string; comment: string; date: string; user_name: string; user_role: string };
export type Document = { _id: string; title: string; link: string; date: string; user_name: string };
export async function api<T>(path: string, init: RequestInit = {}): Promise<T> { const response = await fetch(`${API_URL}${path}`, { ...init, credentials: "include", headers: { ...(init.body instanceof FormData ? {} : { "Content-Type": "application/json" }), ...init.headers }, cache: "no-store" }); if (!response.ok) { const data = await response.json().catch(() => ({})); throw new Error(data.message || "Something went wrong."); } return response.status === 204 ? (undefined as T) : response.json(); }
export { API_URL };
