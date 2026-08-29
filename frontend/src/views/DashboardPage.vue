<script setup>
import { onMounted, ref } from "vue";
import SiteNavbar from "../components/SiteNavbar.vue";
import { api } from "../utils/api";

const stats = ref(null);
const error = ref("");

onMounted(async () => {
  try {
    stats.value = await api.get("/dashboard/stats");
  } catch (err) {
    error.value = err.message;
  }
});
</script>

<template>
  <div class="page-shell">
    <SiteNavbar />
    <main class="container page-section">
      <h1>Welcome to the Construction Management Dashboard</h1>
      <p>Stay updated with your latest projects, tasks, and reports at a glance.</p>
      <p v-if="error" class="status-message error">{{ error }}</p>
      <section v-if="stats" class="quick-stats">
        <h2>Quick Stats</h2>
        <div class="stats-grid">
          <RouterLink to="/projects" class="stat-card"><h3>Ongoing Projects</h3><p>{{ stats.ongoing }}</p></RouterLink>
          <RouterLink to="/projects" class="stat-card"><h3>Tasks Due Today</h3><p>{{ stats.tasksDueToday }}</p></RouterLink>
          <RouterLink to="/projects" class="stat-card"><h3>Completed Projects</h3><p>{{ stats.completed }}</p></RouterLink>
          <RouterLink to="/projects" class="stat-card"><h3>Upcoming Deadlines</h3><p>{{ stats.upcomingDeadlines }}</p></RouterLink>
        </div>
      </section>
    </main>
  </div>
</template>
