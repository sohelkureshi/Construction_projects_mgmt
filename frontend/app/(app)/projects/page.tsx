"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useCurrentUser } from "@/components/auth-guard";
import { api, type Project } from "@/lib/api";
import { can } from "@/lib/roles";

export default function ProjectsPage() {
  const user = useCurrentUser(); const [projects, setProjects] = useState<Project[]>([]);
  useEffect(() => { api<{ projects: Project[] }>("/api/projects").then(({ projects: result }) => setProjects(result)); }, []);
  return <><section className="page-intro split-intro"><div><p className="eyebrow">Portfolio</p><h1>Projects</h1><p>A practical view of the work, people, and dates that make up your portfolio.</p></div>{user && can(user.role, "createProjects") && <Link className="button" href="/projects/new">New project</Link>}</section><section className="project-grid">{projects.map((project) => <Link className="project-card" href={`/projects/${project._id}`} key={project._id}><div className="card-top"><span className={`status ${project.status.replace(" ", "-")}`}>{project.status}</span><span className="arrow">↗</span></div><h2>{project.title}</h2><p>{project.overview}</p><dl><div><dt>Company</dt><dd>{project.company}</dd></div><div><dt>Expected finish</dt><dd>{project.expectedDate ? new Date(project.expectedDate).toLocaleDateString() : "Not set"}</dd></div></dl></Link>)}</section>{!projects.length && <p className="empty-state">No projects have been created yet.</p>}</>;
}
