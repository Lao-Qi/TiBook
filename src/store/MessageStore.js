import { defineStore } from "pinia";
const { ipcRenderer } = require("electron");

export const userMessage = defineStore({
	actions: {
		GetMessageCardList: async () => {
			 return await ipcRenderer.invoke("get local message card list");
		}
	}
})