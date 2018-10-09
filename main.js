const CURRENT_VERSION = "<TTAP_VERSION>1.0.0</TTAP_VERSION>";

// Modules to control application life and create native browser window
const {app, dialog, BrowserWindow, globalShortcut, webFrame} = require('electron')

// disable web security, so that iframe can be accessed
app.commandLine.appendSwitch('disable-web-security'); 

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {

  // Create the browser window.
  mainWindow = new BrowserWindow({webPreferences: {
    webSecurity: false,
    nativeWindowOpen: true
  }});

  globalShortcut.register('CommandOrControl+Shift+i', () => {
    // Open the DevTools.
    mainWindow.webContents.openDevTools()
  })

  globalShortcut.register('CommandOrControl+=', () => {
    // Zoom in
    mainWindow.webContents.getZoomLevel((currentZoomLevel) => {
      mainWindow.webContents.setZoomLevel(currentZoomLevel + 1);
    });
  })

  globalShortcut.register('CommandOrControl+-', () => {
    // Zoom out
    mainWindow.webContents.getZoomLevel((currentZoomLevel) => {
      mainWindow.webContents.setZoomLevel(currentZoomLevel - 1);
    });
  })



  checkForNewerVersion(() => {
    dialog.showMessageBox(mainWindow, {
        message: "There is a newer version available, do you want to download it now?",
        buttons: ["Nope", "Download now"]
      },
      (response) => {
        if(response === 1) { // Means user clicked "Download now"
          const {shell} = require('electron');
          fetch("https://raw.githubusercontent.com/wongjiahau/ttap-desktop-client/master/DOWNLOAD_URL.txt",
          (response) => {
            shell.openExternal(response.toString())
          })
        }
        console.log(response);
      }
    )
  });


  // Turn of menu
  mainWindow.setMenu(null);

  // Set to maximum size on startup
  mainWindow.maximize();

  const DEVELOPING = false;
  mainWindow.loadURL(DEVELOPING ? "http://localhost:3000" : "https://ttap.surge.sh");
  mainWindow.webContents.reloadIgnoringCache();
  // mainWindow.loadFile("./index.html")

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null
  })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.

function checkForNewerVersion(callback) {
  fetch('https://raw.githubusercontent.com/wongjiahau/ttap-desktop-client/master/main.js', (response) => {
    const newVersion = response.toString().match(/<TTAP_VERSION>(.+)<\/TTAP_VERSION>/)[0];
    console.log(CURRENT_VERSION);
    console.log(newVersion);
    if(CURRENT_VERSION !== newVersion)  {
      callback();
    }
  })
}

function fetch(url, callback) {
  const {net} = require('electron')
  const request = net.request(url);
  request.on('response', (response) => {
    response.on('data', (chunk) => {
      callback(chunk);
    })
  })
  request.end()
}