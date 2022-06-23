'use strict';
const { app, ipcMain} = require("electron");
const createLoginWin = require("./windows/loginWin");
const createMainWin = require("./windows/mainWin");

let loginWin = null, mainWin = null;

app.whenReady().then(async () => {
	loginWin = await createLoginWin();
	ipcMain.on("")
	mainWin = createMainWin();
})