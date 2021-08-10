<template>
  <div id="app" :class="{ light: light, focused }">
    <div id="frame">
      <div class="status" v-if="newUpdate" :title="updateHint">
        &#xE72C;
      </div>
      <div class="frame-button" @click="hide">&#xE921;</div>
      <div class="frame-button" @click="close" name="close">&#xE8BB;</div>
    </div>

    <div
      id="background"
      ref="background"
      v-show="usesBackground"
      :style="{ backgroundImage: `url('${backgroundImage}')` }"
    >
      <div class="blur"></div>
    </div>

    <transition name="slide" mode="out-in" class="full">
      <router-view></router-view>
    </transition>
  </div>
</template>

<script>
import electron from "electron";
import fetch from "node-fetch";
import { ipcRenderer, remote } from "electron";

export default {
  name: "infcounter",
  data: () => ({
    w: remote.getCurrentWindow(),
    light: localStorage.getItem("lightMode"),
    subsAuth: null,
    focused: true,
    newUpdate: true,
    updateHint: "Проверка наличия обновлений",
    backgroundImage: "",
    usesBackground: false,
  }),
  methods: {
    checkTheme() {
      this.light =
        localStorage.getItem("lightMode") == "true" && !this.usesBackground;
    },
    close() {
      this.w.close();
    },
    hide() {
      this.w.minimize();
    },
    setBackground() {
      let image = localStorage.getItem("backgroundImage");
      let blurStrength = localStorage.getItem("blurStrength") || "12";
      let brightnessStrength =
        localStorage.getItem("brightnessStrength") || "0.7";
      let elem = this.$refs.background;

      if (image && image != "null") {
        this.backgroundImage = image;
        this.usesBackground = true;

        elem.style.filter = `brightness(${brightnessStrength})`;
        elem.querySelector(
          ".blur"
        ).style.backdropFilter = `blur(${blurStrength}px)`;
      } else this.usesBackground = false;

      this.checkTheme();
    },
    getSubsCount() {
      return new Promise((resolve, reject) => {
        if (!this.subsAuth) return reject("no auth data");

        fetch(
          "https://studio.youtube.com/youtubei/v1/analytics_data/join?alt=json&key=AIzaSyBUPetSUmoZL-OhlxA7wSac5XinrygCqMo",
          {
            headers: this.subsAuth.header,
            body: this.subsAuth.body,
            method: "POST",
            mode: "cors",
          }
        )
          .then((res) => res.json())
          .then((json) => resolve(json))
          .catch((err) => reject(err));
      });
    },
    checkForUpdates() {
      ipcRenderer.send("check-updates");

      ipcRenderer.on("no-updates", () => {
        this.newUpdate = false;
      });

      ipcRenderer.on("new-update", () => {
        this.newUpdate = true;
        this.updateHint = "Загрузка нового обновления";
      });
    },
  },
  beforeMount() {
    // try to restore previous auth data
    try {
      let storedAuth = localStorage.getItem("subsAuth");
      if (storedAuth != null) {
        this.subsAuth = JSON.parse(storedAuth);
      }
    } catch (e) {}
  },
  mounted() {
    this.checkForUpdates();
    this.setBackground();

    remote.getCurrentWindow().on("focus", () => {
      if (remote.getCurrentWindow().isDestroyed()) return;
      this.focused = true;
    });

    remote.getCurrentWindow().on("blur", () => {
      if (remote.getCurrentWindow().isDestroyed()) return;
      this.focused = false;
    });

    ipcRenderer.on("subs-auth-data", (e, data) => {
      localStorage.setItem("subsAuth", JSON.stringify(data));
      this.subsAuth = data;
    });
  },
  beforeDestroy() {
    remote.getCurrentWindow().removeAllListeners();
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
#app.light input[type="text"],
#app.light input[type="number"] {
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
  min-height: 30px;
  width: 100%;
  background: transparent;
  display: flex;
  justify-content: flex-end;
  font-family: "Segoe MDL2 Assets";
  -webkit-app-region: drag;
  z-index: 9;
}

#app.focused #frame .status {
  animation: spin 4s infinite linear;
}

#frame .status {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.4);
  margin: auto 0;
  margin-right: auto;
  margin-left: 8px;
  -webkit-app-region: no-drag;
  position: relative;
  left: -32px;
  transition: 0.2s ease;
}

#background {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  z-index: 0;
  background-position: center;
  background-size: cover;
  filter: brightness(0.7);
  transition: 0.2s ease;
  pointer-events: none;
}

#background .blur {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;
  transition: 0.2s ease;
  backdrop-filter: blur(16px);
}

@keyframes spin {
  0% {
    transform: rotateZ(0deg);
  }

  100% {
    transform: rotateZ(360deg);
  }
}

.frame-button {
  height: 100%;
  width: 38px;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #59a2ff;
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
