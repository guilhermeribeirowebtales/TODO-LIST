import { createApp } from "vue";
import App from "./App.vue";

// --- Router ---
import router from "./router";

// --- Pinia ---
import { createPinia } from "pinia";

// --- Vuetify ---
import "vuetify/styles";
import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

const vuetify = createVuetify({
  components,
  directives,
});

// --- App Initialization ---
const app = createApp(App);
const pinia = createPinia();

app.use(router);
app.use(pinia);
app.use(vuetify);

app.mount("#app");
