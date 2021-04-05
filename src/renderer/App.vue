<template>
  <div id="app" :class="{ light: light == 'true' }">
    <div id="frame">
      <div class="frame-button" @click="hide">&#xE921;</div>
      <div class="frame-button" @click="close" name="close">&#xE8BB;</div>
    </div>
    <transition name="slide" mode="out-in" class="full">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";
const remote = require("electron").remote;

export default {
  name: "infcounter",
  data: () => ({
    w: remote.getCurrentWindow(),
    light: localStorage.getItem("lightMode"),
    subsAuth: null,
    focused: true,
  }),
  methods: {
    checkTheme() {
      this.light = localStorage.getItem("lightMode");
    },
    close() {
      this.w.close();
    },
    hide() {
      this.w.minimize();
    },
    getSubsCount() {
      return new Promise((resolve, reject) => {
        if (this.subsAuth) {
          require("node-fetch")(
            "https://studio.youtube.com/youtubei/v1/analytics_data/join?alt=json&key=AIzaSyBUPetSUmoZL-OhlxA7wSac5XinrygCqMo",
            {
              headers: this.subsAuth.header,
              body: this.subsAuth.body,
              method: "POST",
              mode: "cors",
            }
          )
            .then((res) => {
              return res.json();
            })
            .then((json) => {
              resolve(json);
            })
            .catch((err) => {
              reject(err);
            });
        } else {
          reject("no auth data");
        }
      });
    },
    checkForUpdates() {
      ipcRenderer.send("check-updates");

      // ipcRenderer.on("no-updates", () => {
      //   // alert("No new updates detected");
      //   ipcRenderer.removeAllListeners();
      // });

      // ipcRenderer.on("new-update", () => {
      //   // alert("New update detected!");
      //   ipcRenderer.removeAllListeners();
      // });
    },
  },
  mounted() {
    this.checkForUpdates();

    require("electron")
      .remote.getCurrentWindow()
      .on("focus", () => {
        this.focused = true;
      });

    require("electron")
      .remote.getCurrentWindow()
      .on("blur", () => {
        this.focused = false;
      });

    ipcRenderer.on("subs-auth-data", (e, data) => {
      this.subsAuth = data;
    });
  },
};
</script>

<style>
body {
  margin: 0;
  font-family: "Fira Sans";
  user-select: none;
  overflow: hidden;
}
#app {
  height: 100vh;
  background: rgb(12, 12, 12);
  display: flex;
  flex-direction: column;
}
#app.light {
  background: rgb(255, 255, 255);
}
#app.light .count {
  color: black;
}
#app.light .prefs-button {
  background: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.4);
}
#app.light .prefs-button:hover {
  background: rgba(0, 0, 0, 0.2);
  color: rgba(0, 0, 0, 0.6);
}
#app.light input[type="text"] {
  box-shadow: inset 0px 0px 0px 2px black;
  color: black;
}
#app.light input[type="button"] {
  box-shadow: inset 0px 0px 0px 2px black;
  color: black;
}
#app.light input[type="button"]:hover {
  background: rgb(0, 0, 0, 0.2);
}
#app.light label {
  color: black;
}
#app.light .frame-button:hover {
  background: rgba(0, 0, 0, 0.2);
  color: black;
}
#frame {
  height: 30px;
  width: 100%;
  background: transparent;
  display: flex;
  justify-content: flex-end;
  font-family: "Segoe MDL2 Assets";
  -webkit-app-region: drag;
}
.frame-button {
  height: 100%;
  width: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #4f84c7;
  font-size: 12px;
  transition: 0.2s all;
  -webkit-app-region: no-drag;
}
.frame-button:hover {
  color: white;
  background: rgba(255, 255, 255, 0.1);
}
.frame-button[name="close"]:hover {
  background: #b91919 !important;
}
.slide-leave-active,
.slide-enter-active {
  transition: 0.22s;
}
.slide-enter {
  transform: translate(0, 100%);
  pointer-events: none;
}
.slide-leave-to {
  transform: translate(0, -100%);
  opacity: 0;
}
</style>
