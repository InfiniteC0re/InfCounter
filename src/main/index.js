import { app, BrowserWindow, ipcMain, session } from "electron";
import { autoUpdater } from "electron-updater";
import fetch from "node-fetch";

const expressapp = require("express")();
const http = require("http").createServer(expressapp);
const io = require("socket.io")(http);
var subs = 0;

if (process.env.NODE_ENV !== "development") {
  global.__static = require("path")
    .join(__dirname, "/static")
    .replace(/\\/g, "\\\\");
}

let mainWindow;
let studioWindow;
const winURL =
  process.env.NODE_ENV === "development"
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 180,
    height: 175,
    useContentSize: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false
    },
    autoHideMenuBar: true,
    resizable: false,
    frame: false,
  });

  mainWindow.loadURL(winURL);

  studioWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: "YouTube Studio",
    backgroundColor: "#0c0c0c",
    autoHideMenuBar: true,
    show: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true,
      webSecurity: false
    },
  });

  studioWindow.type = "studio";
  studioWindow.loadURL(
    "https://studio.youtube.com/channel/CHANNEL_ID/analytics/tab-overview/period-default",
    {
      userAgent:
        "Chrome",
    }
  );

  studioWindow.on("close", (e) => {
    e.preventDefault();
    studioWindow.hide();
  });

  let getSubsDetails = {};

  session.defaultSession.webRequest.onBeforeSendHeaders(
    {
      urls: [
        "https://studio.youtube.com/youtubei/v1/analytics_data/join?alt=json&key=*",
      ],
    },
    (details, callback) => {
      if (details.requestHeaders && details.uploadData) {
        callback(details);

        session.defaultSession.cookies
          .get({
            url:
              "https://studio.youtube.com/youtubei/v1/analytics_data/join?alt=json&key=*",
          })
          .then((cookies) => {
            getSubsDetails.url = details.url;
            getSubsDetails.header = details.requestHeaders;
            getSubsDetails.body = Array.from(
              details.uploadData
            )[0].bytes.toString();

            let cookiesString = "";
            cookies.forEach((cookie) => {
              cookiesString += `${cookie.name}=${cookie.value}; `;
            });

            getSubsDetails.cookies = cookiesString;

            mainWindow.webContents.send("subs-auth-data", getSubsDetails);
          })
          .catch((error) => {
            console.log(error);
          });
      }
    }
  );

  ipcMain.on("check-updates", (event, args) => {
    if (process.env.NODE_ENV === "production") {
      autoUpdater.checkForUpdatesAndNotify();

      autoUpdater.on("update-not-available", () => {
        event.reply("no-updates");
        autoUpdater.removeAllListeners();
      });

      autoUpdater.on("update-available", () => {
        event.reply("new-update");
        autoUpdater.removeAllListeners();
      });

      autoUpdater.on("download-progress", (e) => {
        mainWindow.setProgressBar(e.percent / 100);
      });

      autoUpdater.on("update-downloaded", () => {
        autoUpdater.quitAndInstall();
      });
    }
  });

  ipcMain.on("update-subs", (e, newSubs) => {
    subs = newSubs;
    io.emit("new_data_subs", subs);
  });

  ipcMain.on("dashboard", (event, args) => {
    mainWindow.webContents.send("subs-count", args.subs);
    subs = args.subs;
    io.emit("new_data_subs", subs);
  });

  ipcMain.on("show-studio", () => {
    studioWindow.show();
  });

  mainWindow.on("closed", () => {
    ipcMain.removeAllListeners();
    mainWindow = null;
    app.exit();
  });
}

app.commandLine.appendSwitch("disable-features", "OutOfBlinkCors");

app.on("ready", () => {
  session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
    details.requestHeaders["User-Agent"] =
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 11_5_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.131 Safari/537.36";
    callback({ cancel: false, requestHeaders: details.requestHeaders });
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow();
  }
});

expressapp.get("/", function(req, res) {
  res.redirect("https://hlsr.pro/ytstats/");
});

io.on("connection", function(socket) {
  socket.emit("new_data_subs", subs);
});

http.listen(3000);
