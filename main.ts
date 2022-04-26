// Modules to control application life and create native browser window
import { app, BrowserWindow, shell, Event } from "electron";

app.on(
  "certificate-error",
  (event, webContents, url, error, certificate, callback) => {
    event.preventDefault();
    callback(true);
  }
);

// Refer https://github.com/electron/electron/issues/18214#issuecomment-495043193
app.commandLine.appendSwitch("disable-site-isolation-trials");

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    webPreferences: {
      webSecurity: false, // To enable CORS
    },
  });
  redirectLinkToSystemBrowser(mainWindow.webContents);

  mainWindow.maximize();

  // and load the index.html of the app.
  const DESKTOP_CLIENT_VERSION = 2;
  mainWindow.loadURL(
    `https://ttap.surge.sh?desktop-client-version=${DESKTOP_CLIENT_VERSION}`
  );
  // mainWindow.loadURL(
  //   `http://localhost:3000?desktop-client-version=${DESKTOP_CLIENT_VERSION}`
  // );

  // mainWindow.webContents.openDevTools();

  mainWindow.webContents.session.on(
    "will-download",
    (event, item, webContents) => {
      item.once("done", (event, state) => {
        if (state === "completed") {
          // Refer https://github.com/aterenin/right-click-external-app/issues/2
          shell.openPath(item.getSavePath());
        } else {
          console.log(`Download failed: ${state}`);
        }
      });
    }
  );

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()

  // Emitted when the window is closed.
  mainWindow.on("closed", function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed.
app.on("window-all-closed", function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function redirectLinkToSystemBrowser(
  webContents: BrowserWindow["webContents"]
) {
  var handleRedirect = (e: Event, url: string) => {
    if (url != webContents.getURL()) {
      e.preventDefault();
      shell.openExternal(url);
    }
  };
  webContents.on("will-navigate", handleRedirect);
  webContents.on("new-window", handleRedirect);
}
