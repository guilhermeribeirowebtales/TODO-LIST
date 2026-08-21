import { createApp } from "vue";
import { createPinia } from "pinia";
import piniaPluginPersistedstate from "pinia-plugin-persistedstate";

import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(vuetify);

app.mount("#app");

//This file is responsible for creating the Vue app, regestering Pinia (our state managment and local storage),
// the vue-router and then vuetify. All mounting on our app
