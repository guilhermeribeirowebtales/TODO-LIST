import { defineStore } from "pinia";

export const useMainStore = defineStore("main", {
  state: () => ({
    message: "Pinia is working!",
  }),
  actions: {
    setMessage(newMessage) {
      this.message = newMessage;
    },
  },
});
