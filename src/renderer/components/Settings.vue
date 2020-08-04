<template>
  <div id="wrapper">
    <div class="hint">ID трансляции:</div>
    <div class="line" style="margin-left: 0">
      <input placeholder="95mM72TaFsc" type="text" style="margin-left: 0;" v-model="id" />
    </div>
    <div style="display:flex; margin-top: 22px">
      <input type="button" style="margin-right: 2px" @click="widget" value="Виджет" />
      <input type="button" style="margin-left: 2px" @click="yt" value="Студия" />
    </div>
    <input type="button" @click="save" value="Сохранить" />
  </div>
</template>

<script>
import { ipcRenderer } from 'electron';

export default {
  name: "settings",
  data: () => ({
    id: null
  }),
  methods: {
    save() {
      localStorage.setItem("id", this.id);

      let router = this.$router;
      router.push({ path: "/" });
    },
    yt() {
        ipcRenderer.send("show-studio");
    },
    widget() {
      require("electron").remote.shell.openExternal("http://127.0.0.1:3000");
    }
  },
  mounted() {
      this.id = localStorage.getItem("id") || ""
  }
};
</script>

<style scoped>
#wrapper {
  padding: 0 8px;
  padding-bottom: 16px;
}
.hint {
  color: rgb(140, 140, 140);
  font-size: 10px;
  margin-top: 6px;
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
  box-shadow: inset 0px 0px 0px 2px white;
}
input[type="text"] {
  width: 100%;
  margin-left: 6px;
  border: none;
  outline: none;
  background: transparent;
  box-shadow: inset 0px 0px 0px 2px white;
  padding: 0px 6px;
  color: white;
  border-radius: 4px;
  font-family: "Fira Sans";
  font-size: 12px;
  height: 26px;
}
.line {
  margin-top: 4px;
  margin-left: 6px;
  display: flex;
  width: 100%;
}
input[type="button"] {
  font-family: "Fira Sans";
  width: 100%;
  height: 26px;
  border: none;
  outline: none;
  box-shadow: inset 0px 0px 0px 2px white;
  border-radius: 2px;
  margin-top: 6px;
  background: transparent;
  color: white;
  cursor: pointer;
  font-size: 12px;
  transition: 0.1s background;
}
input[type="button"]:hover {
  background: rgb(60, 60, 60);
}
</style>