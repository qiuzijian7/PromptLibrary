<template>
  <div class="tabs">
    <div ref="navWrap" class="tabs-nav-wrap" :class="[scrollable ? 'tabs-nav-scrollable' : '']">
      <span
        class="tabs-nav-prev"
        :class="[scrollable ?  '' : 'tabs-nav-scroll-disabled']"
        @click="scrollPrev"
      >&lt;</span>
      <span
        class="tabs-nav-next"
        :class="[scrollable ?  '' : 'tabs-nav-scroll-disabled']"
        @click="scrollNext"
      >&gt;</span>
      <div ref="navScroll" class="tabs-nav-scroll">
        <div ref="nav" class="tabs-nav" :style="navStyle">
          <div class="tabs-inv-bar" :style="barStyle"></div>
          <div
            class="tabs-tab"
            v-for="(item, index) in navList"
            :key="index"
            @click="handleChange(index)"
          >
                {{item.label}}
                <!-- <input type="text" v-model="item.work.data.name" /> -->
          </div>
        </div>
      </div>
    </div>
    <div class="pane-content">
      <slot></slot>
    </div>
  </div>
</template>
<script>
import elementResizeDetectorMaker from 'element-resize-detector'

export default {
  name: 'Tabs',
  provide() {
    return { TabsInstance: this }
  },
  props: {
    value: {
      type: [String, Number]
    },
  },
  data() {
    return {
      navList: [],
      activeKey: this.value,
      barWidth: 0,
      barOffset: 0,
      scrollable: false,
      navStyle: {
        transform: ''
      }
    }
  },
  computed: {
    barStyle() {
      return {
        width: `${this.barWidth}px`,
        transform: `translate3d(${this.barOffset}px,0px,0px)`
      }
    }
  },
  methods: {
    getTabs() {
      return this.$children.filter(item => item.$options.name === 'TabPane')
    },
    initTabs() {
      this.updateNav()
      this.updateStatus()
      this.updataBar()
    },
    updateNav() {
      this.navList = []
      this.getTabs().forEach((pane, index) => {
        this.navList.push({
          label: pane.label,
          name: pane.name || index,
          work: pane.promptWork
        })
       
        if (index === 0 && !this.activeKey) {
          this.activeKey = pane.name
        }
      })

      let target = 'addwork';
      let id = -1; // 找到元素的索引
      this.navList.forEach((value,index)=>{
          if(value.name == target)
          {
              id = index;
          }
        }

      )

      let item = this.navList[id]; // 找到元素的索引
      if (id !== -1) {
        this.navList.splice(id, 1); // 删除元素
        this.navList.push(item); // 添加到数组末尾
      }
    },
    updataBar() {
      this.$nextTick(() => {
        const index = this.navList.findIndex(nav => nav.name === this.activeKey)
        const elemTabs = this.$refs.navWrap.querySelectorAll('.tabs-tab')
        const elemTab = elemTabs[index]
        this.barWidth = elemTab ? elemTab.offsetWidth : 0
        if (index > 0) {
          let offset = 0
          for (let i = 0; i < index; i++) {
            offset += elemTabs[i].offsetWidth + 16
          }
          this.barOffset = offset
        } else {
          this.barOffset = 0
        }
      })
    },
    updateStatus() {
      const tabs = this.getTabs()
      tabs.forEach(tab => (tab.show = tab.name === this.activeKey))
    },
    handleChange(index) {
        const nav = this.navList[index]
        if(nav.name !== 'addwork')
        {
          this.activeKey = nav.name
        }
        else
        {
          this.$emit('addWorkEvent');
        }

    },
    handleResize() {
      const navWidth = this.$refs.nav.offsetWidth
      const scrollWidth = this.$refs.navScroll.offsetWidth
      if (scrollWidth < navWidth) {
        this.scrollable = true
      } else {
        this.scrollable = false
      }
      this.updateMove()
    },
    updateMove() {
      const navWidth = this.$refs.nav.offsetWidth
      const scrollWidth = this.$refs.navScroll.offsetWidth
      const currentOffset = this.getCurrentScrollOffset()
      if (scrollWidth < navWidth) {
        if (navWidth - currentOffset < scrollWidth) {
          this.navStyle.transform = `translateX(-${navWidth - scrollWidth}px)`
        }
      } else {
        if (currentOffset > 0) {
          this.navStyle.transform = `translateX(-${0}px)`
        }
      }
    },
    getCurrentScrollOffset() {
      const { navStyle } = this
      const reg = /translateX\(-(\d+(\.\d+)*)px\)/
      const matches = navStyle.transform?.match(reg) 
      const num = matches?.length >=1 ? Number(navStyle.transform.match(reg)[1]):0
      return num
    },
    setOffset(value) {
      this.navStyle.transform = `translateX(-${value}px)`
    },
    scrollPrev() {
      const containerWidth = this.$refs.navScroll.offsetWidth
      const currentOffset = this.getCurrentScrollOffset()
      if (!currentOffset) return
      let newOffset = 0
      if (currentOffset > containerWidth) {
        newOffset = currentOffset - containerWidth
      }
      this.navStyle.transform = `translateX(-${newOffset}px)`
    },
    scrollNext() {
      const navWidth = this.$refs.nav.offsetWidth
      const containerWidth = this.$refs.navScroll.offsetWidth
      const currentOffset = this.getCurrentScrollOffset()
      if (navWidth - currentOffset <= containerWidth) return
      let newOffset = null
      if (navWidth - currentOffset > containerWidth * 2) {
        newOffset = currentOffset + containerWidth
      } else {
        newOffset = navWidth - containerWidth
      }
      this.navStyle.transform = `translateX(-${newOffset}px)`
    }
   
  },
  watch: {
    value(val) {
      this.activeKey = val
    },
    activeKey() {
      this.updateStatus()
      this.updataBar()
    }

  },
  mounted() {
    this.observer = elementResizeDetectorMaker()
    this.observer.listenTo(this.$refs.navWrap, this.handleResize)
  },
  beforeDestroy() {
    this.observer.removeListener(this.$refs.navWrap, this.handleResize)
  }
}
</script>
<style lang="scss">
.tabs {
  .tabs-nav-wrap {
    position: relative;
    border-bottom: 1px solid #dcdee2;
    margin-bottom: 16px;
  }
  .tabs-tab {
    position: relative;
    display: inline-block;
    margin-right: 16px;
    padding: 8px 16px;
    cursor: pointer;
  }
  .tabs-inv-bar {
    position: absolute;
    left: 0;
    bottom: 0;
    background-color: #2d8cf0;
    height: 2px;
    transition: transform 300ms ease-in-out;
  }

  .tabs-nav-scroll {
    overflow: hidden;
    white-space: nowrap;
  }
  .tabs-nav {
    position: relative;
    float: left;
    transition: transform 0.5s ease-in-out;
  }

  .tabs-nav-prev, .tabs-nav-next {
    position: absolute;
    width: 32px;
    line-height: 32px;
    text-align: center;
    cursor: pointer;
  }
  .tabs-nav-prev {
    left: 0;
  }
  .tabs-nav-next {
    right: 0;
  }
  .tabs-nav-scrollable {
    padding: 0 32px;
  }
  .tabs-nav-scroll-disabled {
    display: none;
  }
}
</style>
