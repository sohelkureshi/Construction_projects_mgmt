"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api, type Project } from "@/lib/api";
import { ProjectForm } from "@/components/project-form";
export default function EditProjectPage() { const { id } = useParams<{ id: string }>(); const [project, setProject] = useState<Project | null>(null); useEffect(() => { api<{ project: Project }>(`/api/projects/${id}`).then(({ project }) => setProject(project)); }, [id]); return <>{project ? <><section className="page-intro"><p className="eyebrow">Project settings</p><h1>Edit {project.title}</h1></section><ProjectForm project={project} /></> : <p>Loading project...</p>}</>; }
