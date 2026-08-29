<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import SiteNavbar from "../components/SiteNavbar.vue";
import { api } from "../utils/api";

const route = useRoute();
const router = useRouter();
const isEdit = computed(() => Boolean(route.params.projectId));
const form = ref({ title: "", supervisor: "", company: "", overview: "", location: "", duration: "", status: "", startDate: "", expectedDate: "" });
const error = ref("");

onMounted(async () => {
  if (!isEdit.value) return;
  try {
    const data = await api.get(`/projects/${route.params.projectId}`);
    const project = data.project;
    form.value = { ...form.value, ...project, startDate: project.startDate ? project.startDate.slice(0, 10) : "", expectedDate: project.expectedDate ? project.expectedDate.slice(0, 10) : "" };
  } catch (err) {
    error.value = err.message;
  }
});

async function submit() {
  try {
    if (isEdit.value) {
      await api.put(`/projects/${route.params.projectId}`, form.value);
      router.push(`/projects/${route.params.projectId}`);
    } else {
      const data = await api.post("/projects", form.value);
      router.push(`/projects/${data.project._id}`);
    }
  } catch (err) {
    error.value = err.message;
  }
}
</script>

<template>
  <div class="page-shell">
    <SiteNavbar />
    <section class="container page-section">
      <div class="simple-card">
        <h1>{{ isEdit ? "Edit Project" : "Add Project" }}</h1>
        <p v-if="error" class="status-message error">{{ error }}</p>
        <form class="form-stack" @submit.prevent="submit">
          <input v-model="form.title" placeholder="Project Title" required />
          <input v-model="form.supervisor" placeholder="Supervisor" required />
          <input v-model="form.company" placeholder="Company" required />
          <textarea v-model="form.overview" placeholder="Overview" required />
          <input v-model="form.location" placeholder="Location" required />
          <input v-model="form.duration" placeholder="Duration" required />
          <input v-model="form.status" placeholder="Status" required />
          <input v-model="form.startDate" type="date" required />
          <input v-model="form.expectedDate" type="date" required />
          <button class="btn primary" type="submit">{{ isEdit ? "Save Changes" : "Create Project" }}</button>
        </form>
      </div>
    </section>
  </div>
</template>
