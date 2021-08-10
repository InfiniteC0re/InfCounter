<template>
  <div id="wrapper">
    <p class="hint">Сила размытия</p>
    <div class="line" style="margin-left: 0">
      <input
        spellcheck="false"
        placeholder="16"
        type="number"
        min="0"
        max="32"
        v-model="blurStrength"
        @input="updateBackground"
      />
    </div>
    <p class="hint" style="margin-top:6px">Уровень яркости</p>
    <div class="line" style="margin-left: 0">
      <input
        spellcheck="false"
        placeholder="0.7"
        type="number"
        min="0"
        max="32"
        v-model="brightnessStrength"
        @input="updateBackground"
      />
    </div>
    <div class="grid4" style="margin-top: auto">
      <input
        type="button"
        class="stretched2-1"
        @click="openFile"
        value="Выбор"
      />
      <input
        type="button"
        class="stretched2-2"
        @click="reset"
        value="Сбросить"
      />
      <input type="button" class="stretched4" @click="save" value="Сохранить" />
    </div>
  </div>
</template>

<script>
import fs from "fs";
import { ipcRenderer, remote } from "electron";

export default {
  name: "background-settings",
  data: () => ({
    blurStrength: localStorage.getItem("blurStrength") || "12",
    brightnessStrength: localStorage.getItem("brightnessStrength") || "0.7",
  }),
  methods: {
    save(redirect = true) {
      localStorage.setItem("blurStrength", this.blurStrength);
      localStorage.setItem("brightnessStrength", this.brightnessStrength);
      if (redirect) this.$router.push({ path: "/settings" });
    },
    openFile() {
      var path = remote.dialog.showOpenDialogSync({
        title: "Выбор фонового изображения",
        filters: [{ name: "Изображения", extensions: ["jpg", "png", "jpeg"] }],
      });

      if (path && path.length > 0 && fs.existsSync(path[0])) {
        this.save(false);
        localStorage.setItem("backgroundImage", path[0].replace(/\\/g, "/"));
        this.$parent.setBackground();
      }
    },
    updateBackground() {
      let elem = this.$parent.$refs.background;
      elem.style.filter = `brightness(${this.brightnessStrength})`;
      elem.querySelector(
        ".blur"
      ).style.backdropFilter = `blur(${this.blurStrength}px)`;
    },
    reset() {
      this.blurStrength = "12";
      this.brightnessStrength = "0.7";
      localStorage.setItem("backgroundImage", null);
      this.$parent.setBackground();
      this.save(false);
    },
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
input[type="number"] {
  width: 100%;
  border: none;
  outline: none;
  background: transparent;
  box-shadow: inset 0px 0px 0px 2px var(--border-color);
  color: white;
  padding: 4px 6px;
  border-radius: 4px;
  font-family: "Fira Sans";
  font-size: 11px;
}

input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.line {
  margin-left: 6px;
  display: flex;
  width: 100%;
}
input[type="button"] {
  font-family: "Fira Sans";
  width: 100%;
  padding: 4px;
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
input[type="button"].stretched4 {
  grid-column-start: 1;
  grid-column-end: 5;
}

input[type="button"].stretched2-1 {
  grid-column-start: 1;
  grid-column-end: 3;
}

input[type="button"].stretched2-2 {
  grid-column-start: 3;
  grid-column-end: 5;
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
.grid4 {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1fr;
  gap: 4px;
}
</style>
