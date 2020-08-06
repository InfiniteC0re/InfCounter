import { app, BrowserWindow, ipcMain } from 'electron'
import { autoUpdater } from 'electron-updater'

const expressapp = require('express')()
const http = require('http').createServer(expressapp);
const io = require('socket.io')(http)
var subs = 0;

if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

let mainWindow
let studioWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

function createWindow () {
  mainWindow = new BrowserWindow({
    width: 180,
    height: 172,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false
    },
    autoHideMenuBar: true,
    resizable: false,
    frame: false
  })

  mainWindow.loadURL(winURL)

  studioWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "YouTube Studio",
    backgroundColor: "#0c0c0c",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      experimentalFeatures: true,
      nodeIntegration: true
    }
  });

  studioWindow.type = "studio";
  studioWindow.loadURL("https://studio.youtube.com", {
    userAgent: 'Chrome'
  });

  studioWindow.on("close", (e) => {
    e.preventDefault();
    studioWindow.hide();
  });
  
  ipcMain.on("check-updates", (event, args) => {
    if (process.env.NODE_ENV === 'production')
    {
      autoUpdater.checkForUpdatesAndNotify();

      autoUpdater.on('update-not-available', () => {
        event.reply("no-updates");
        autoUpdater.removeAllListeners();
      });

      autoUpdater.on('update-available', () => {
        event.reply("new-update");
        autoUpdater.removeAllListeners();
      });

      autoUpdater.on('download-progress', (e) => {
        mainWindow.setProgressBar(e.percent / 100);
      })
    
      autoUpdater.on('update-downloaded', () => {
        autoUpdater.quitAndInstall();
      });
    };
  });

  ipcMain.on("dashboard", (event, args) => {
    mainWindow.webContents.send("subs-count", args.subs);
    subs = args.subs;
    io.emit("new_data_subs", subs);
  });

  ipcMain.on("get-subs", (event) => {
    if(studioWindow.webContents.getURL().includes("https://studio.youtube.com/channel/"))
    {
      console.log(5)
      studioWindow.webContents.executeJavaScript(`
        try{
          let subs = document.querySelectorAll(".subscribers-title")[0].nextElementSibling.innerText;
          let channelId = document.body.innerHTML.match(/\\/channel\\/([^\\s\\/"]*)/)[1];
          require('electron').ipcRenderer.send('dashboard', {
            "subs": subs,
            "channelId": channelId
          });
          window.location.reload();
        }catch(e){}
      `);
    };
  });

  ipcMain.on("show-studio", () => {
    studioWindow.show();
  });

  mainWindow.on('closed', () => {
    ipcMain.removeAllListeners();
    mainWindow = null;
    app.exit();
  })
}

app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

expressapp.get('/', function(req, res){
  res.redirect("https://hlspeedrun.com/ytstats/");
});

io.on('connection', function(socket){
  socket.emit('new_data_subs', subs);
});

http.listen(3000);