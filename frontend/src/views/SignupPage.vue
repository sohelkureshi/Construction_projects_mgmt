<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import SiteNavbar from "../components/SiteNavbar.vue";
import { authStore } from "../stores/auth";

const router = useRouter();
const form = ref({ name: "", email: "", password: "", role: "guest" });
const error = ref("");
const success = ref("");
const loading = ref(false);

async function submit() {
  loading.value = true;
  error.value = "";
  success.value = "";
  try {
    const response = await authStore.signup(form.value);
    success.value = response.message;
    if (authStore.user) router.push("/dashboard");
    else router.push("/login");
  } catch (err) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div class="page-shell">
    <SiteNavbar />
    <section class="hero">
      <div class="container">
        <div class="hero-content">
          <h1>Transform Your Construction Management</h1>
          <p>Collaborate, track, and succeed with our comprehensive project management solution.</p>
        </div>
        <img src="/images/full backgroundd.png" alt="Construction Management Dashboard" class="hero-image" />
      </div>
    </section>
    <section class="signup-section">
      <div class="container">
        <div class="signup-card">
          <h2>Create Your Account</h2>
          <form class="signup-form" @submit.prevent="submit">
            <input v-model="form.name" type="text" placeholder="Full Name" required />
            <input v-model="form.email" type="email" placeholder="Email Address" required />
            <input v-model="form.password" type="password" placeholder="Password" required />
            <select v-model="form.role" required>
              <option value="guest">Guest (View Only)</option>
              <option value="engineer">Site Engineer/Jr Engineer (Billing/Progress)</option>
              <option value="contractor">Contractor (Add/Edit/Delete)</option>
              <option value="manager">Manager (Add/Edit/Delete)</option>
              <option value="senior-manager">Senior Manager (Approve Changes)</option>
              <option value="admin">Admin (Approve/Reject Account Requests)</option>
            </select>
            <p v-if="error" class="status-message error">{{ error }}</p>
            <p v-if="success" class="status-message">{{ success }}</p>
            <button type="submit" class="btn primary" :disabled="loading">{{ loading ? "Creating..." : "Create Account" }}</button>
          </form>
          <p class="login-link">Already have an account? <RouterLink to="/login">Login here</RouterLink></p>
        </div>
      </div>
    </section>
  </div>
</template>
