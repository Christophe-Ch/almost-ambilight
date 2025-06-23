const { app, BrowserWindow, ipcMain } = require("electron");
const path = require("node:path");
const { WizLight } = require("wiz-light");

const wl = new WizLight("192.168.1.23"); // IP address of your light (check from router)
wl.setLightStatus(true);

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  ipcMain.on("set-color", (_, color) => {
    wl.setLightProps({
      r: color.r,
      g: color.g,
      b: color.b,
      c: 0, // Disable cold white
      w: 0, // Disable warm white
      dimming: 100,
    });
  });

  win.loadFile("index.html");
  win.webContents.openDevTools();
};

app.whenReady().then(() => {
  createWindow();
});
