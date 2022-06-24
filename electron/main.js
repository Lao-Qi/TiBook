'use strict';
const { app, ipcMain} = require("electron");
const createLoginWin = require("./windows/loginWin");
const createMainWin = require("./windows/mainWin");

let loginWin = null, mainWin = null, currentWin = null;

app.whenReady().then(async () => {
	loginWin = await createLoginWin();
	currentWin = loginWin;
	ipcMain.on("login complete", (event, token) => {
		if(token) {
			mainWin = createMainWin();
			currentWin = mainWin;
		}
	})

	ipcMain.on("window-minimize", () => currentWin.minimize());
	ipcMain.on("window-maximize", () => currentWin.isMaximized() ? currentWin.unmaximize() : currentWin.maximize());
	ipcMain.on("window-destroy", () => currentWin.destroy());
	currentWin.on("maximize", () => currentWin.webContents.send("window-maximize"));
	currentWin.on("unmaximize", () => currentWin.webContents.send("window-unmaximize"));
})