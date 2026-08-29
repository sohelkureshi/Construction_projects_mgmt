import { reactive } from "vue";
import { api } from "../utils/api";

export const authStore = reactive({
  user: null,
  initialized: false,
  async init() {
    if (this.initialized) return;
    try {
      const data = await api.get("/auth/me");
      this.user = data.user;
    } catch {
      this.user = null;
    } finally {
      this.initialized = true;
    }
  },
  async login(payload) {
    const data = await api.post("/auth/login", payload);
    this.user = data.user;
    return data;
  },
  async signup(payload) {
    const data = await api.post("/auth/signup", payload);
    if (data.user) this.user = data.user;
    return data;
  },
  async logout() {
    await api.post("/auth/logout");
    this.user = null;
  }
});
