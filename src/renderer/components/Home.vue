<template>
  <div id="wrapper" :class="{ shadows }">
    <div :class="{ 'prefs-button': true }" @click="openSettings">
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
      <div class="count" id="subs-count" :data-target="subs">0</div>
    </div>
    <div class="line">
      <div class="hint icon">
        <i
          class="fas fa-thumbs-up"
          :class="{ gray: failedStreamCheck }"
          style="color: #1cc31c"
        ></i>
      </div>
      <div class="count" id="likes-count" :data-target="likes">0</div>
    </div>
    <div class="line">
      <div class="hint icon">
        <i
          class="fas fa-users"
          :class="{ gray: failedStreamCheck }"
          style="color: #0087ff"
        ></i>
      </div>
      <div class="count" id="views-count" :data-target="viewers">0</div>
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
    shadows: false,
    animations: {
      animatedTime: 1500,
    },
  }),
  computed: {
    hasAuthData() {
      return this.$parent.subsAuth != null;
    },
    focused() {
      return this.$parent.focused;
    },
  },
  watch: {
    likes(likes, _likes) {
      likes = parseInt(likes);
      ipcRenderer.send("update-likes", {
        current: likes,
        target: likes + 100 - (likes % 100),
      });
    },
  },
  methods: {
    openSettings() {
      let router = this.$router;
      router.push({ path: "/settings" });
    },
    numberWithCommas(x) {
      return parseInt(x)
        .toString()
        .replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    },
    animateValue(elem, current, target, stepTime, range) {
      const time = this.animations.animatedTime;

      let startTime = Date.now();
      let initial = current;
      let direction = target < current ? -1 : 1;

      let intervalID = setInterval(() => {
        current =
          initial + ((Date.now() - startTime) / time) * range * direction;
        elem.innerHTML = this.numberWithCommas(Math.round(current));

        if (
          (current >= target && direction > 0) ||
          (current <= target && direction < 0)
        ) {
          elem.innerHTML = this.numberWithCommas(target);
          clearInterval(intervalID);
        }
      }, stepTime);
    },
    animate() {
      const time = this.animations.animatedTime;

      let elems = document.querySelectorAll("*[data-target]");
      elems.forEach((elem) => {
        let hasTarget = elem.hasAttribute("data-target");

        if (hasTarget) {
          let target = parseInt(elem.getAttribute("data-target"));
          let current = parseInt(elem.innerHTML.replace(/,/g, ""));

          if (!isNaN(target) && !isNaN(current)) {
            if (target != current) {
              const range =
                Math.max(current, target) - Math.min(current, target);
              const stepTime = time / range;

              this.animateValue(elem, current, target, stepTime, range);
            }
          }
        }
      });
    },
    _updateSubs() {
      fetch("https://www.youtube.com/watch?v=" + localStorage.getItem("id"))
        .then((a) => {
          return a.text();
        })
        .then((data) => {
          var showNewValues = () => {
            this.$nextTick(() => {
              this.animate();
            });
          };

          try {
            let likesMethod1 = data.match(
              /(?<likes>[0-9 ]+) \/ (?<dislikes>[0-9 ]+)/
            );

            if (likesMethod1) {
              this.likes = likesMethod1.groups.likes.replace(/ /g, "");
            } else {
              let likesMethod2 = data.match(
                /("defaultText":{"accessibility":{"accessibilityData":{"label":")(?<likes>[\d ]*)/
              );

              if (likesMethod2)
                this.likes = likesMethod2.groups.likes.replace(/ /g, "");
              else this.likes = 0;
            }

            this.viewers = data
              .match(
                /({"viewCount":{"runs":\[{"text":"(.*?)"},{"text":"(.*?)"})/
              )[3]
              .match(/\d/g)
              .join("");

            this.failedStreamCheck = false;
            showNewValues();
          } catch (e) {
            this.likes = 0;
            this.viewers = 0;
            this.failedStreamCheck = true;
            showNewValues();
          }
        });
    },
    updateData() {
      this.$parent
        .getSubsCount()
        .then((json) => {
          let subs =
            json.results[0].value.getCards.cards[0]
              .cumulativeSubscribersCardData.lifetimeTotal;

          ipcRenderer.send("update-subs", subs);

          this.subs = subs;
          this._updateSubs();
        })
        .catch((err) => {
          this._updateSubs();
        });
    },
  },
  mounted() {
    this.updateData();

    this.interval = setInterval(() => {
      this.updateData();
    }, 6000);

    this.shadows = localStorage.getItem("useShadows") == "true";
    this.$parent.checkTheme();
  },
  beforeDestroy() {
    clearInterval(this.interval);
  },
};
</script>

<style scoped>
#wrapper {
  position: relative;
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-around;
  padding: 6px 0;
}

#wrapper.shadows {
  filter: drop-shadow(2px 2px 0 rgba(0, 0, 0, 0.3));
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
  right: 12px;
  bottom: 12px;
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

*.focused .prefs-button {
  transform: translateX(0px);
  opacity: 1;
}

.gray {
  color: rgb(140, 140, 140) !important;
}
</style>
