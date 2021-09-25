<template>
  <div id="wrapper">
    <p class="hint">ID трансляции</p>
    <div class="line" style="margin-left: 0">
      <input
        spellcheck="false"
        placeholder="95mM72TaFsc"
        type="text"
        v-model="id"
      />
    </div>
    <div style="display:flex;align-items:center;margin-top:6px">
      <input
        type="checkbox"
        :disabled="disableLightmode"
        id="lightmode"
        v-model="lightMode"
      />
      <label for="lightmode">Светлая тема</label>

      <input
        type="checkbox"
        id="shadows"
        v-model="useShadows"
        style="margin: 0 0 0 12px"
      />
      <label for="shadows" style="margin: 2px 0 0 4px">Тени</label>
    </div>
    <div class="buttons">
      <input type="button" @click="showSubsWidget" value="Сабы" />
      <input type="button" @click="showLikesWidget" value="Лайки" />
      <input type="button" @click="showStudio" value="YT" />
      <input type="button" @click="openBackgroundSettings" value="UI" />
      <input
        type="button"
        style="flex-basis: 100%"
        @click="save"
        value="Сохранить"
      />
    </div>
  </div>
</template>

<script>
import { ipcRenderer, remote } from "electron";

export default {
  name: "settings",
  data: () => ({
    id: localStorage.getItem("id") || "",
    lightMode: localStorage.getItem("lightMode") == "true",
    useShadows: localStorage.getItem("useShadows") == "true",
    disableLightmode: true,
  }),
  methods: {
    save(redirect = true) {
      localStorage.setItem("id", this.id);
      localStorage.setItem("lightMode", this.lightMode);
      localStorage.setItem("useShadows", this.useShadows);

      if (redirect) this.$router.push({ path: "/" });
    },
    showStudio() {
      ipcRenderer.send("show-studio");
    },
    showSubsWidget() {
      remote.shell.openExternal("https://hlsr.pro/ytstats/");
    },
    showLikesWidget() {
      remote.shell.openExternal("https://hlsr.pro/ytstats/likes/#32a0ff;7;50");
    },
    openBackgroundSettings() {
      this.save(false);
      this.$router.push({ path: "/background" });
    },
  },
  mounted() {
    this.disableLightmode = this.$parent.usesBackground;
  },
};
</script>

<style scoped>
#wrapper {
  --border-color: rgba(255, 255, 255, 1);
  --hover-color: rgba(255, 255, 255, 0.1);
  padding: 8px;
  z-index: 9;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.hint {
  color: rgb(140, 140, 140);
  font-size: 10px;
  margin: 0 0 2px 4px;
}
.count {
  font-size: 30px;
  margin-left: 8px;
  color: white;
}
.color {
  min-height: 26px;
  min-width: 26px;
  width: 26px;
  height: 26px;
  background: white;
  border-radius: 2px;
  box-shadow: inset 0px 0px 0px 2px var(--border-color);
}
input[type="text"] {
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  box-shadow: inset 0px 0px 0px 2px var(--border-color);
  color: white;
  padding: 6px;
  border-radius: 4px;
  font-family: "Fira Sans";
  font-size: 11px;
}
.line {
  margin-left: 6px;
  display: flex;
  width: 100%;
}
input[type="button"] {
  font-family: "Fira Sans";
  flex: 1;
  height: 22px;
  border: none;
  outline: none;
  border-radius: 2px;
  box-shadow: inset 0px 0px 0px 2px var(--border-color);
  background: transparent;
  color: white;
  cursor: pointer;
  font-size: 11px;
  transition: 0.1s background;
}
input[type="button"].stretched3 {
  grid-column-start: 1;
  grid-column-end: 4;
}
input[type="button"]:hover {
  background: var(--hover-color);
}
label {
  font-size: 11px;
  color: white;
  margin-left: 2px;
  margin-top: 2px;
}
.buttons {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
  margin-top: auto;
}
</style>
