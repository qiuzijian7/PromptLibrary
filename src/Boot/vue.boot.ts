import Vue from "vue"
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'
import { version } from 'vue'

// ----------------- 全局组件 -----–––––––––––––––-
import { Icon as vIcon } from "@iconify/vue2"
// ----------------------–––––––––––––––-
import vRoot from "../Pages/Root.vue"
import { getPagesRouter } from "../Pages"
import VueLazyload from 'vue-lazyload'  //引入这个懒加载插件

export function bootVue(setVueHandler?: (VueConstructor: typeof Vue) => any) {
    // 设置 Vue
    if (setVueHandler) setVueHandler(Vue)

    console.log(version) // 输出当前使用的 Vue 版本号
    // --------––––––––––––––––––––––––––––––
    Vue.component("Icon", vIcon)
    Vue.use(FloatingVue)
    Vue.use(VueLazyload, {
        preLoad: 1,
        error: new URL('./web/public/404.jpg',import.meta.url),
        loading:new URL('./web/public/loading-spin.svg',import.meta.url), 
        attempt: 2,
      })
    // --------––––––––––––––––––––––––––––––
    let router = getPagesRouter(Vue)
    let vueIns = new Vue({
        el: "#app-root",
        router,
        render: (h) => h(vRoot),
    })

    // 注册变量
    Object.assign(window, {
        vueIns,
        _Vue: Vue,
    })
    return { Vue, vueIns }
}
