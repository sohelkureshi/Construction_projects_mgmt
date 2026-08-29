<script setup>
import { computed, onMounted, ref } from "vue";
import SiteNavbar from "../components/SiteNavbar.vue";
import { authStore } from "../stores/auth";
import { api } from "../utils/api";

const projects = ref([]);
const error = ref("");
const canEdit = computed(() => ["manager", "contractor", "admin"].includes(authStore.user?.role));

onMounted(async () => {
  try {
    const data = await api.get("/projects");
    projects.value = data.projects;
  } catch (err) {
    error.value = err.message;
  }
});
</script>

<template>
  <div class="page-shell">
    <SiteNavbar />
    <main class="container page-section">
      <div class="page-actions">
        <h1>Projects</h1>
        <RouterLink v-if="canEdit" to="/projects/new" class="btn primary">Add Project</RouterLink>
      </div>
      <p v-if="error" class="status-message error">{{ error }}</p>
      <div class="project-grid">
        <RouterLink v-for="project in projects" :key="project._id" :to="`/projects/${project._id}`" class="project-card">
          <h3>{{ project.title }}</h3>
          <p>{{ project.overview }}</p>
          <span>Status: {{ project.status }}</span>
        </RouterLink>
      </div>
    </main>
  </div>
</template>
