<script setup>
import { onMounted, ref } from "vue";
import SiteNavbar from "../components/SiteNavbar.vue";
import { api } from "../utils/api";

const users = ref([]);
const error = ref("");

async function load() {
  try {
    const data = await api.get("/admin/users");
    users.value = data.users;
  } catch (err) {
    error.value = err.message;
  }
}

async function approve(id) {
  await api.post(`/admin/users/${id}/approve`);
  await load();
}

async function reject(id) {
  await api.delete(`/admin/users/${id}`);
  await load();
}

onMounted(load);
</script>

<template>
  <div class="page-shell">
    <SiteNavbar />
    <section class="container page-section">
      <h1>Role Management</h1>
      <p v-if="error" class="status-message error">{{ error }}</p>
      <div class="simple-card table-wrap">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user._id">
              <td>{{ user.name }}</td>
              <td>{{ user.email }}</td>
              <td>{{ user.role }}</td>
              <td>{{ user.approved ? "Approved" : "Pending" }}</td>
              <td class="page-actions">
                <button v-if="!user.approved" class="btn primary" @click="approve(user._id)">Approve</button>
                <button class="btn primary" @click="reject(user._id)">Reject</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </div>
</template>
