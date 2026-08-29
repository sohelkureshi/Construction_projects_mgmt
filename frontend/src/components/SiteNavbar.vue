<script setup>
import { computed } from "vue";
import { useRouter } from "vue-router";
import { authStore } from "../stores/auth";

const router = useRouter();
const user = computed(() => authStore.user);

async function logout() {
  await authStore.logout();
  router.push("/login");
}
</script>

<template>
  <nav class="navbar">
    <div class="container">
      <RouterLink :to="user ? '/dashboard' : '/signup'" class="logo">Construction Management</RouterLink>
      <div class="nav-links">
        <template v-if="user">
          <RouterLink to="/dashboard" class="nav-link">Dashboard</RouterLink>
          <RouterLink to="/projects" class="nav-link">Projects</RouterLink>
          <RouterLink v-if="user.role === 'admin'" to="/admin/roles" class="nav-link">Roles</RouterLink>
          <button class="btn primary" type="button" @click="logout">Logout</button>
        </template>
        <template v-else>
          <RouterLink to="/login" class="nav-link">Login</RouterLink>
          <RouterLink to="/signup" class="btn primary">Sign Up</RouterLink>
        </template>
      </div>
    </div>
  </nav>
</template>
