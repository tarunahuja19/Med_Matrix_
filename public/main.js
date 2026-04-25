import { app, BrowserWindow,Menu } from 'electron';
Menu.setApplicationMenu(null);
const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  })
  win.loadURL('http://localhost:5173/')
}

app.whenReady().then(() => {
  
  createWindow()
})