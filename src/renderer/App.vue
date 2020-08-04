<template>
  <div id="app">
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
const remote = require("electron").remote

export default {
  name: "infcounter",
  data: () => ({
    w: remote.getCurrentWindow()
  }),
  methods: {
    close() {
      this.w.close();
    },
    hide() {
      this.w.minimize();
    },
    checkForUpdates() {
      ipcRenderer.send("check-updates");

      ipcRenderer.on("no-updates", () => {
        // alert("No new updates detected");
        ipcRenderer.removeAllListeners();
      });

      ipcRenderer.on("new-update", () => {
        // alert("New update detected!");
        ipcRenderer.removeAllListeners();
      });
    },
  },
  mounted() {
    this.checkForUpdates();
  }
};
</script>

<style>
body {
  margin: 0;
  background: rgb(12, 12, 12);
  font-family: "Fira Sans";
  user-select: none;
  overflow: hidden;
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
  background: #b91919;
}
.slide-leave-active,
.slide-enter-active {
  transition: .22s;
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
