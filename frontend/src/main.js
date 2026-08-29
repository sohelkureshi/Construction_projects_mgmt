import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { authStore } from "./stores/auth";
import "./styles/base.css";

await authStore.init();

createApp(App).use(router).mount("#app");
