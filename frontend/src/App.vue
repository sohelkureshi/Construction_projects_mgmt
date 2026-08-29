<script setup>
import { computed, watch } from "vue";
import { RouterView, useRoute } from "vue-router";

const route = useRoute();
const stylesheets = computed(() => route.meta.stylesheets || []);

watch(
  stylesheets,
  (links) => {
    document.querySelectorAll("[data-route-css]").forEach((node) => node.remove());
    links.forEach((href) => {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = href;
      link.dataset.routeCss = "true";
      document.head.appendChild(link);
    });
  },
  { immediate: true }
);
</script>

<template>
  <RouterView />
</template>
