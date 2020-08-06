<template>
  <div id="wrapper" @dblclick="openSettings">
    <div class="line">
      <div class="hint icon">
        <i class="fas fa-star" style="color:#ff0050"></i>
      </div>
      <div class="count" id="subs-count">{{subs}}</div>
    </div>
    <div class="line">
      <div class="hint icon">
        <i class="fas fa-thumbs-up" style="color:#1cc31c"></i>
      </div>
      <div class="count" id="likes-count">{{likes}}</div>
    </div>
    <div class="line">
      <div class="hint icon">
        <i class="fas fa-users" style="color:#0087ff"></i>
      </div>
      <div class="count" id="views-count">{{viewers}}</div>
    </div>
  </div>
</template>

<script>
import { ipcRenderer } from "electron";

export default {
  name: "home",
  data: () => ({
    subs: 0,
    likes: 0,
    viewers: 0,
  }),
  methods: {
    openSettings() {
      let router = this.$router;
      router.push({path: '/settings'});
    },
    updateData() {
      let ctx = this;
      ipcRenderer.send("get-subs");

      ipcRenderer.once("subs-count", (e, args) => {
        fetch("https://www.youtube.com/watch?v=" + localStorage.getItem("id"))
          .then((a) => {
            return a.text();
          })
          .then((data) => {
            try {
              ctx.viewers = JSON.parse(
                data.match(/({"viewCount":{"runs":\[{"text"):"(.*?)"}]}/g) + "}"
              )
                .viewCount.runs[0].text.split(":")
                .splice(1)
                .join("")
                .split("")
                .slice(1)
                .join("");
              ctx.likes = JSON.parse(
                "{" +
                  data
                    .match(
                      /({"iconType":"LIKE"},"defaultText":{"accessibility":{"accessibilityData":{"label"):"(.*?)"}}/g
                    )[0]
                    .split(",")
                    .splice(1)
                    .join("") +
                  "}}"
              )
                .defaultText.accessibility.accessibilityData.label.split(":")
                .splice(1)
                .join("");
              ctx.subs = args;
            } catch (e) {
              ctx.likes = 0;
              ctx.viewers = 0;
              ctx.subs = args;
            }
          });
      });
    },
  },
  mounted() {
    this.updateData();
    
    setInterval(() => {
      this.updateData();
    }, 10000)
  },
};
</script>

<style>
.icon{
  width: 26px;
  justify-content: center !important;
  align-items: center !important;
}
.hint {
  color: rgb(140, 140, 140);
  margin-left: 4px;
  margin-right: 4px;
  display: flex;
  justify-content: flex-start;
  align-items: center;
}
.count {
  font-size: 30px;
  margin-left: 8px;
  color: white;
}
.fas {
  font-size: 18px;
}
.line {
  display: flex;
  align-items: center;
  margin: 8px;
}
</style>
