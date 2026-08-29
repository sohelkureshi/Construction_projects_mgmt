import { createRouter, createWebHistory } from "vue-router";
import { authStore } from "./stores/auth";
import AdminRolesPage from "./views/AdminRolesPage.vue";
import DashboardPage from "./views/DashboardPage.vue";
import LoginPage from "./views/LoginPage.vue";
import ProjectDetailsPage from "./views/ProjectDetailsPage.vue";
import ProjectFormPage from "./views/ProjectFormPage.vue";
import ProjectsPage from "./views/ProjectsPage.vue";
import SignupPage from "./views/SignupPage.vue";

const withCss = (...names) => ["/css/navbar.css", ...names.map((name) => `/css/${name}.css`)];

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", redirect: "/signup" },
    { path: "/login", component: LoginPage, meta: { guestOnly: true, stylesheets: withCss("login") } },
    { path: "/signup", component: SignupPage, meta: { guestOnly: true, stylesheets: withCss("signup") } },
    { path: "/dashboard", component: DashboardPage, meta: { requiresAuth: true, stylesheets: withCss("dashboard") } },
    { path: "/projects", component: ProjectsPage, meta: { requiresAuth: true, stylesheets: withCss("listofprojects") } },
    { path: "/projects/new", component: ProjectFormPage, meta: { requiresAuth: true, stylesheets: withCss("addproject") } },
    { path: "/projects/:projectId/edit", component: ProjectFormPage, meta: { requiresAuth: true, stylesheets: withCss("editproject") } },
    { path: "/projects/:projectId", component: ProjectDetailsPage, meta: { requiresAuth: true, stylesheets: withCss("project_details", "billing", "listview_progress", "view_comments", "documents") } },
    { path: "/admin/roles", component: AdminRolesPage, meta: { requiresAuth: true, adminOnly: true, stylesheets: withCss("role") } }
  ]
});

router.beforeEach(async (to) => {
  if (!authStore.initialized) {
    await authStore.init();
  }

  if (to.meta.requiresAuth && !authStore.user) {
    return "/login";
  }

  if (to.meta.guestOnly && authStore.user) {
    return "/dashboard";
  }

  if (to.meta.adminOnly && authStore.user?.role !== "admin") {
    return "/dashboard";
  }

  return true;
});

export default router;
