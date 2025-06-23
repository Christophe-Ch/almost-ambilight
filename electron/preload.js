const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  setColor: (color) => ipcRenderer.send("set-color", color),
});
