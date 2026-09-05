"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useCurrentUser } from "@/components/auth-guard";
import { BillingWorkspace } from "@/components/billing-workspace";
import { api, type Project } from "@/lib/api";
import { can } from "@/lib/roles";

const formatDate = (value?: string) => value ? new Date(value).toLocaleDateString() : "Not set";

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const user = useCurrentUser();
  const [project, setProject] = useState<Project | null>(null);
  const [notice, setNotice] = useState("");
  const load = () => api<{ project: Project }>(`/api/projects/${id}`).then(({ project: result }) => setProject(result)).catch((error) => setNotice(error.message));

  useEffect(() => { load(); }, [id]);

  const submit = async (event: FormEvent<HTMLFormElement>, endpoint: string, multipart = false) => {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    try {
      await api(endpoint, { method: "POST", body: multipart ? formData : JSON.stringify(Object.fromEntries(formData)) });
      form.reset(); setNotice("Saved successfully."); load();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to save this update."); }
  };

  const addDocument = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form));
    try {
      await api(`/api/projects/${id}/documents/${values.type}`, { method: "POST", body: JSON.stringify({ title: values.title, link: values.link }) });
      form.reset(); setNotice("Document added."); load();
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to add document."); }
  };

  if (!project || !user) return <p className="page-loader">Loading project...</p>;
  const allowProjectEdit = can(user.role, "editProjects");
  const allowProgress = can(user.role, "createProgress");
  const allowBills = can(user.role, "createBill");
  const allowDocuments = can(user.role, "createDocuments");
  const allowComments = can(user.role, "createComments");

  return <>
    <section className="project-hero">
      <div><Link className="back-link" href="/projects">Back to all projects</Link><p className="eyebrow">{project.company}</p><h1>{project.title}</h1><p>{project.overview}</p></div>
      <div><span className={`status ${project.status.replace(" ", "-")}`}>{project.status}</span>{allowProjectEdit && <Link className="button button-outline" href={`/projects/${id}/edit`}>Edit project</Link>}</div>
    </section>
    <div className="project-workspace">
      <aside className="project-sidebar"><p className="eyebrow">Project workspace</p><a href="#overview">Overview</a><a href="#progress">Progress <span>{project.progresses?.length || 0}</span></a><a href="#billing">Bills <span>{project.bills?.length || 0}</span></a><a href="#documents">Documents</a><a href="#comments">Comments <span>{project.comments?.length || 0}</span></a></aside>
      <div className="project-content">
        <section id="overview" className="project-section"><div className="section-heading"><div><p className="eyebrow">At a glance</p><h2>Project details</h2></div><span className="role-name">{user.role.replace("-", " ")} access</span></div><div className="detail-grid project-details"><article><span>Supervisor</span><b>{project.supervisor}</b></article><article><span>Location</span><b>{project.location}</b></article><article><span>Start date</span><b>{formatDate(project.startDate)}</b></article><article><span>Expected finish</span><b>{formatDate(project.expectedDate)}</b></article><article><span>Duration</span><b>{project.duration}</b></article><article><span>Current status</span><b>{project.status}</b></article></div></section>
        {notice && <p className="notice">{notice}</p>}
        <section id="progress" className="project-section"><div className="section-heading"><div><p className="eyebrow">Site records</p><h2>Progress updates</h2></div>{allowProgress && <span className="permission-label">Engineer, contractor, admin</span>}</div><div className="record-grid">{project.progresses?.length ? project.progresses.map((item) => <article className="record-card" key={item._id}><span className="status ongoing">{item.completed ? "Completed" : `${item.percentage}% complete`}</span><h3>{item.task}</h3><p>{item.description}</p><small>{formatDate(item.initial_date)} to {formatDate(item.final_date)}</small></article>) : <p className="empty-state">No progress updates have been added.</p>}</div>{allowProgress && <details><summary>Add progress update</summary><form onSubmit={(event) => submit(event, `/api/projects/${id}/progress`, true)}><input name="task" placeholder="Task name" required /><div className="form-inline"><input name="initial_date" type="date" required /><input name="final_date" type="date" required /><input name="percentage" type="number" min="0" max="100" placeholder="% complete" required /></div><textarea name="description" placeholder="Describe the work completed" required /><label className="checkbox"><input name="completed" type="checkbox" value="true" /> Mark as complete</label><input name="images" type="file" accept="image/*" multiple /><button className="button">Save progress</button></form></details>}</section>
        <section id="billing" className="project-section"><div className="section-heading"><div><p className="eyebrow">Commercial control</p><h2>Materials, quantities and running bills</h2></div>{allowBills && <span className="permission-label">Engineer, contractor, admin</span>}</div><BillingWorkspace projectId={id} bills={project.bills || []} canCreate={allowBills} onSaved={() => { setNotice("Running bill saved as draft."); load(); }} /></section>
        <section id="documents" className="project-section"><div className="section-heading"><div><p className="eyebrow">Reference files</p><h2>Drawings and tender documents</h2></div>{allowDocuments && <span className="permission-label">Contributors</span>}</div><div className="document-grid">{[...(project.drawings || []), ...(project.tenders || [])].map((document) => <a className="document-tile" href={document.link} target="_blank" key={document._id}><span>Open link</span><b>{document.title}</b><small>{formatDate(document.date)} · {document.user_name}</small></a>)}{!project.drawings?.length && !project.tenders?.length && <p className="empty-state">No project documents have been linked.</p>}</div>{allowDocuments && <details><summary>Add drawing or tender link</summary><form onSubmit={addDocument}><select name="type" defaultValue="drawings"><option value="drawings">Drawing</option><option value="tenders">Tender document</option></select><input name="title" placeholder="Document title" required /><input name="link" type="url" placeholder="Google Drive or document URL" required /><button className="button">Add document</button></form></details>}</section>
        <section id="comments" className="project-section"><div className="section-heading"><div><p className="eyebrow">Project conversation</p><h2>Comments</h2></div>{allowComments && <span className="permission-label">Contributors</span>}</div><div className="comment-list">{project.comments?.length ? project.comments.map((comment) => <article className="comment-card" key={comment._id}><div><b>{comment.user_name}</b><span>{comment.user_role.replace("-", " ")}</span></div><p>{comment.comment}</p><small>{formatDate(comment.date)}</small></article>) : <p className="empty-state">No comments yet.</p>}</div>{allowComments && <form className="comment-form" onSubmit={(event) => submit(event, `/api/projects/${id}/comments`)}><textarea name="comment" placeholder="Add a project comment" required /><button className="button">Post comment</button></form>}</section>
      </div>
    </div>
  </>;
}
