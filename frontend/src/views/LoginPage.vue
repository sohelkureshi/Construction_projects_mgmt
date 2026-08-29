<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import SiteNavbar from "../components/SiteNavbar.vue";
import { authStore } from "../stores/auth";

const router = useRouter();
const email = ref("");
const password = ref("");
const error = ref("");
const loading = ref(false);

async function submit() {
  loading.value = true;
  error.value = "";
  try {
    await authStore.login({ email: email.value, password: password.value });
    router.push("/dashboard");
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
    <section class="hero login-hero">
      <div class="container">
        <div class="auth-card">
          <div class="auth-header">
            <h2>Login to Continue</h2>
            <div class="social-login">
              <button class="google-btn" type="button">
                <i class="fab fa-google"></i>
                Continue with Google
              </button>
            </div>
            <div class="divider"><span>or</span></div>
          </div>
          <form class="auth-form" @submit.prevent="submit">
            <div class="form-group">
              <label>Email Address</label>
              <input v-model="email" type="email" required />
              <i class="fas fa-envelope icon"></i>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input v-model="password" type="password" required />
              <i class="fas fa-lock icon"></i>
            </div>
            <p v-if="error" class="status-message error">{{ error }}</p>
            <button type="submit" class="btn primary" :disabled="loading">
              <i class="fas fa-sign-in-alt"></i> {{ loading ? "Signing In..." : "Login" }}
            </button>
          </form>
          <div class="auth-footer">
            New to Construction Management?
            <RouterLink to="/signup">Create an account</RouterLink>
          </div>
        </div>
      </div>
    </section>
    <div class="footer"><p>&copy; 2024 Construction Management. All rights reserved.</p></div>
  </div>
</template>
