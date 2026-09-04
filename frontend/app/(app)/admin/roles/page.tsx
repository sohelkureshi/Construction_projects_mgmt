"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useCurrentUser } from "@/components/auth-guard";
import { api, type User } from "@/lib/api";
import { roleSummaries } from "@/lib/roles";

export default function RolesPage() {
  const router = useRouter();
  const currentUser = useCurrentUser();
  const [users, setUsers] = useState<User[]>([]);
  const [error, setError] = useState("");
  const loadUsers = () => api<{ users: User[] }>("/api/admin/users").then(({ users }) => setUsers(users)).catch((requestError) => setError(requestError.message));

  useEffect(() => {
    if (currentUser?.role !== "admin") { router.replace("/dashboard"); return; }
    loadUsers();
  }, [currentUser, router]);

  const updateApproval = async (userId: string, approved: boolean) => {
    await api(`/api/admin/users/${userId}/approval`, { method: "PATCH", body: JSON.stringify({ approved }) });
    loadUsers();
  };
  const removeUser = async (userId: string) => {
    if (!window.confirm("Remove this account permanently?")) return;
    await api(`/api/admin/users/${userId}`, { method: "DELETE" });
    loadUsers();
  };

  if (currentUser?.role !== "admin") return null;
  return <><section className="page-intro"><p className="eyebrow">Administration</p><h1>Roles and access</h1><p>Approve team accounts and keep every person’s responsibilities clear.</p></section><section className="role-grid">{Object.entries(roleSummaries).map(([role, description]) => <article key={role}><span className="role-name">{role.replace("-", " ")}</span><p>{description}</p></article>)}</section><section className="content-section"><div className="section-heading"><div><p className="eyebrow">Accounts</p><h2>Team access requests</h2></div><span>{users.filter((user) => !user.approved).length} pending</span></div>{error && <p className="form-error">{error}</p>}<div className="user-table"><div className="user-table-head"><span>Name</span><span>Role</span><span>Status</span><span>Actions</span></div>{users.filter((user) => user.role !== "admin").map((user) => <div className="user-table-row" key={user._id}><span><b>{user.name}</b><small>{user.email}</small></span><span className="role-name">{user.role.replace("-", " ")}</span><span className={user.approved ? "approval approved" : "approval pending"}>{user.approved ? "Approved" : "Pending"}</span><span className="table-actions">{!user.approved && <button className="text-button" onClick={() => updateApproval(user._id, true)}>Approve</button>}{user.approved && <button className="text-button" onClick={() => updateApproval(user._id, false)}>Revoke</button>}<button className="danger-button" onClick={() => removeUser(user._id)}>Remove</button></span></div>)}</div></section></>;
}
