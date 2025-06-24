const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electronAPI", {
  // Navigation
  navigate: (route) => ipcRenderer.send("navigate", route),

  // Print functionality
  print: () => ipcRenderer.invoke("print"),

  // File operations
  saveFile: (data, filename) => ipcRenderer.invoke("save-file", data, filename),

  // System info
  getSystemInfo: () => ipcRenderer.invoke("get-system-info"),
})
