<script setup>
import { computed, onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import SiteNavbar from "../components/SiteNavbar.vue";
import { authStore } from "../stores/auth";
import { api } from "../utils/api";

const route = useRoute();
const project = ref(null);
const billForm = ref({ bill_id: "", date: "", Bill_Name: "", previous_amount: 0, total_amount: 0, items: [{ item_id: 1, name: "", quantity: 0, units: "", rate: 0, amount: 0 }] });
const progressForm = ref({ task: "", initial_date: "", final_date: "", percentage: 0, completed: false, description: "" });
const progressImages = ref([]);
const comment = ref("");
const drawing = ref({ title: "", link: "" });
const tender = ref({ title: "", link: "" });
const error = ref("");
const canProjectEdit = computed(() => ["manager", "contractor", "admin"].includes(authStore.user?.role));
const canBillCreate = computed(() => ["engineer", "contractor", "admin"].includes(authStore.user?.role));
const canProgressCreate = computed(() => ["engineer", "contractor", "admin"].includes(authStore.user?.role));

async function load() {
  try {
    const data = await api.get(`/projects/${route.params.projectId}`);
    project.value = data.project;
  } catch (err) {
    error.value = err.message;
  }
}

function addBillItem() {
  billForm.value.items.push({ item_id: billForm.value.items.length + 1, name: "", quantity: 0, units: "", rate: 0, amount: 0 });
}

async function submitBill() {
  await api.post(`/projects/${route.params.projectId}/bills`, billForm.value);
  billForm.value = { bill_id: "", date: "", Bill_Name: "", previous_amount: 0, total_amount: 0, items: [{ item_id: 1, name: "", quantity: 0, units: "", rate: 0, amount: 0 }] };
  await load();
}

async function submitProgress() {
  const payload = new FormData();
  Object.entries(progressForm.value).forEach(([key, value]) => payload.append(key, value));
  progressImages.value.forEach((file) => payload.append("image", file));
  await api.post(`/projects/${route.params.projectId}/progress`, payload);
  progressForm.value = { task: "", initial_date: "", final_date: "", percentage: 0, completed: false, description: "" };
  progressImages.value = [];
  await load();
}

async function submitComment() {
  await api.post(`/projects/${route.params.projectId}/comments`, { comment: comment.value });
  comment.value = "";
  await load();
}

async function submitDrawing() {
  await api.post(`/projects/${route.params.projectId}/documents/drawing`, drawing.value);
  drawing.value = { title: "", link: "" };
  await load();
}

async function submitTender() {
  await api.post(`/projects/${route.params.projectId}/documents/tender`, tender.value);
  tender.value = { title: "", link: "" };
  await load();
}

onMounted(load);
</script>

<template>
  <div class="page-shell">
    <SiteNavbar />
    <section class="container page-section">
      <p v-if="error" class="status-message error">{{ error }}</p>
      <div v-if="project" class="simple-grid two-col">
        <div class="simple-card">
          <h1>{{ project.title }}</h1>
          <p>{{ project.overview }}</p>
          <p><strong>Supervisor:</strong> {{ project.supervisor }}</p>
          <p><strong>Company:</strong> {{ project.company }}</p>
          <p><strong>Location:</strong> {{ project.location }}</p>
          <p><strong>Status:</strong> {{ project.status }}</p>
          <p><strong>Timeline Progress:</strong> {{ project.timelineProgress }}%</p>
          <div class="panel-links">
            <RouterLink v-if="canProjectEdit" :to="`/projects/${project._id}/edit`" class="btn primary">Edit Project</RouterLink>
          </div>
        </div>

        <div class="simple-card">
          <h2>Billing</h2>
          <ul class="list-reset simple-grid">
            <li v-for="bill in project.bills" :key="bill._id">{{ bill.Bill_Name }} - {{ bill.total_amount }}</li>
          </ul>
          <form v-if="canBillCreate" class="form-stack" @submit.prevent="submitBill" style="margin-top: 1rem;">
            <input v-model="billForm.bill_id" type="number" placeholder="Bill ID" />
            <input v-model="billForm.date" type="date" required />
            <input v-model="billForm.Bill_Name" placeholder="Bill Name" required />
            <input v-model="billForm.previous_amount" type="number" placeholder="Previous Amount" />
            <input v-model="billForm.total_amount" type="number" placeholder="Total Amount" required />
            <div v-for="(item, index) in billForm.items" :key="index" class="simple-grid two-col">
              <input v-model="item.name" placeholder="Item Name" required />
              <input v-model="item.quantity" type="number" placeholder="Quantity" required />
              <input v-model="item.units" placeholder="Units" required />
              <input v-model="item.rate" type="number" placeholder="Rate" required />
              <input v-model="item.amount" type="number" placeholder="Amount" required />
            </div>
            <button class="btn primary" type="button" @click="addBillItem">Add Item</button>
            <button class="btn primary" type="submit">Create Bill</button>
          </form>
        </div>

        <div class="simple-card">
          <h2>Progress</h2>
          <ul class="list-reset simple-grid">
            <li v-for="item in project.progresses" :key="item._id">{{ item.task }} - {{ item.percentage }}%</li>
          </ul>
          <form v-if="canProgressCreate" class="form-stack" @submit.prevent="submitProgress" style="margin-top: 1rem;">
            <input v-model="progressForm.task" placeholder="Task" required />
            <input v-model="progressForm.initial_date" type="date" required />
            <input v-model="progressForm.final_date" type="date" required />
            <input v-model="progressForm.percentage" type="number" min="0" max="100" required />
            <label><input v-model="progressForm.completed" type="checkbox" /> Completed</label>
            <textarea v-model="progressForm.description" placeholder="Description" required />
            <input type="file" multiple @change="progressImages = Array.from($event.target.files || [])" />
            <button class="btn primary" type="submit">Create Progress</button>
          </form>
        </div>

        <div class="simple-card">
          <h2>Comments</h2>
          <ul class="list-reset simple-grid">
            <li v-for="item in project.comments" :key="item._id"><strong>{{ item.user_name }}</strong> ({{ item.user_role }})<br />{{ item.comment }}</li>
          </ul>
          <form class="form-stack" @submit.prevent="submitComment" style="margin-top: 1rem;">
            <textarea v-model="comment" placeholder="Add a comment" required />
            <button class="btn primary" type="submit">Post Comment</button>
          </form>
        </div>

        <div class="simple-card">
          <h2>Drawings</h2>
          <ul class="list-reset simple-grid">
            <li v-for="item in project.drawings" :key="`${item.title}-${item.link}`"><a :href="item.link" target="_blank" rel="noreferrer">{{ item.title }}</a></li>
          </ul>
          <form class="form-stack" @submit.prevent="submitDrawing" style="margin-top: 1rem;">
            <input v-model="drawing.title" placeholder="Drawing Title" required />
            <input v-model="drawing.link" placeholder="Drive Link" required />
            <button class="btn primary" type="submit">Add Drawing</button>
          </form>
        </div>

        <div class="simple-card">
          <h2>Tenders</h2>
          <ul class="list-reset simple-grid">
            <li v-for="item in project.tenders" :key="`${item.title}-${item.link}`"><a :href="item.link" target="_blank" rel="noreferrer">{{ item.title }}</a></li>
          </ul>
          <form class="form-stack" @submit.prevent="submitTender" style="margin-top: 1rem;">
            <input v-model="tender.title" placeholder="Tender Title" required />
            <input v-model="tender.link" placeholder="Drive Link" required />
            <button class="btn primary" type="submit">Add Tender</button>
          </form>
        </div>
      </div>
    </section>
  </div>
</template>
