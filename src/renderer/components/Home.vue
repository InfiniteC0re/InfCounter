<template>
  <div id="wrapper">
    <div
      :class="{ 'prefs-button': true, showed: focused }"
      @click="openSettings"
    >
      <i class="fas fa-cog"></i>
    </div>
    <div class="line">
      <div class="hint icon">
        <i
          class="fas fa-star"
          :class="{ gray: !hasAuthData }"
          style="color: #ff0050"
        ></i>
      </div>
      <div class="count" id="subs-count">{{ subs }}</div>
    </div>
    <div class="line">
      <div class="hint icon">
        <i
          class="fas fa-thumbs-up"
          :class="{ gray: failedStreamCheck }"
          style="color: #1cc31c"
        ></i>
      </div>
      <div class="count" id="likes-count">{{ likes }}</div>
    </div>
    <div class="line">
      <div class="hint icon">
        <i
          class="fas fa-users"
          :class="{ gray: failedStreamCheck }"
          style="color: #0087ff"
        ></i>
      </div>
      <div class="count" id="views-count">{{ viewers }}</div>
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
    interval: null,
    failedStreamCheck: true,
  }),
  computed: {
    hasAuthData() {
      return this.$parent.subsAuth != null;
    },
    focused() {
      return this.$parent.focused;
    },
  },
  methods: {
    openSettings() {
      let router = this.$router;
      router.push({ path: "/settings" });
    },
    numberWithCommas(x) {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    updateData() {
      this.$parent
        .getSubsCount()
        .then((json) => {
          let subs =
            json.results[0].value.getCards.cards[0]
              .cumulativeSubscribersCardData.lifetimeTotal;
          ipcRenderer.send("update-subs", subs);

          this.subs = this.numberWithCommas(subs);
          fetch("https://www.youtube.com/watch?v=" + localStorage.getItem("id"))
            .then((a) => {
              return a.text();
            })
            .then((data) => {
              try {
                this.likes = this.numberWithCommas(
                  data
                    .match(
                      /"LIKE"},"defaultText":{"accessibility":{"accessibilityData":{"label":"(.*?)"/
                    )[0]
                    .match(/\d/g)
                    .join("")
                );
                this.viewers = this.numberWithCommas(
                  data
                    .match(
                      /({"viewCount":{"runs":\[{"text":"(.*?)"},{"text":"(.*?)"})/
                    )[3]
                    .match(/\d/g)
                    .join("")
                );
                this.failedStreamCheck = false;
              } catch (e) {
                this.likes = 0;
                this.viewers = 0;
                this.failedStreamCheck = true;
              }
            });
        })
        .catch((err) => {
          console.log(err);
        });
    },
  },
  mounted() {
    this.updateData();

    this.interval = setInterval(() => {
      this.updateData();
    }, 10000);

    this.$parent.checkTheme();
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
};
</script>

<style>
#wrapper {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 6px 0;
}
.icon {
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
  transition: 0.2s color ease;
}
.line {
  display: flex;
  align-items: center;
  margin: 0 8px;
}
.prefs-button {
  opacity: 0;
  transform: translateX(64px);
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.4);
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: 0.1s background, 0.1s color, 0.3s opacity, 0.3s transform;
}
.prefs-button:hover {
  background: rgba(255, 255, 255, 0.2);
  color: rgba(255, 255, 255, 0.6);
}

.showed {
  transform: translateX(0px);
  opacity: 1;
}

.gray {
  color: rgb(140, 140, 140) !important;
}
</style>
