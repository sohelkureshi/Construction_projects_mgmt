import type { User } from "./api";

type Role = User["role"];

const capabilities: Record<Role, string[]> = {
  guest: [],
  engineer: ["createProgress", "createBill", "createDocuments", "createComments"],
  contractor: ["createProjects", "editProjects", "createProgress", "createBill", "createDocuments", "createComments"],
  manager: ["createProjects", "editProjects", "createDocuments", "createComments"],
  "senior-manager": ["createDocuments", "createComments"],
  admin: ["createProjects", "editProjects", "createProgress", "createBill", "createDocuments", "createComments", "manageUsers"],
};

export const can = (role: Role, capability: string) => capabilities[role]?.includes(capability);

export const roleSummaries: Record<Role, string> = {
  guest: "View projects, progress, bills, documents, and comments.",
  engineer: "View the workspace and add progress records, bills, documents, and comments.",
  contractor: "Manage projects and contribute progress, bills, documents, and comments.",
  manager: "Create and edit projects, and contribute documents and comments.",
  "senior-manager": "Review the workspace and contribute documents and comments.",
  admin: "Full project access, plus approve or reject team accounts.",
};
