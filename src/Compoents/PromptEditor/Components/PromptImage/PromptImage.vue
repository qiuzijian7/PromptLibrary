<!-- Created on 2023/03/20 - 21:44 -->
<template>
    <div
        @click="onClick"
        @contextmenu.prevent="$emit('contextmenu', { el: $el, item, event: $event })"
        @mousedown="onMousedown"
    >
        <div  class="image-container" >
            <img class="image-container img" v-lazy="item.image" alt="none"/>         
        </div>
    </div>
</template>
<style lang="scss">
.image-container {
  width: 100px;
  height: 100px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.image-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
   margin: 5px;
}

@import "./subImage.scss";
</style>
<script lang="ts">
import Vue, { PropType } from "vue"
import { PromptImage } from "../../Sub/PromptImage"
import { IPromptWord } from "../../Lib/parsePrompts/parsePrompts"
import { useClipboard } from "@vueuse/core"
import { PromptList } from "../../Sub/PromptList"
let { copy } = useClipboard({ legacy: true })
export default Vue.extend({
    props: {
        item: { type: Object as PropType<PromptImage>, required: true },
        list: { type: Object as PropType<PromptList> },
        
    },
    data(){
        return{
            testimg:  new URL("/404.jpg", import.meta.url).href
        }
    },
    watch: {
        item: {
            handler(val) {
                // console.log("observable", JSON.stringify(val,null,2))
                Vue.observable(val)
            },
            immediate: true,
        },
        "item.state.isEdit": {
            handler(val) {
                if (val) setTimeout(() => this.doFoucs(), 100)
            },
            immediate: true,
        },
    },

    methods: {
        copy,
        onMousedown(e: MouseEvent) {
            if (e.detail > 1) {
                e.preventDefault()
            }
        },
        doOpenUrl(url: string) {
            window.open(url)
        },
        doFoucs() {
            setTimeout(() => {
                if (this.item.state.isEdit == "text") {
                    ;(this.$refs.input as any)?.focus()
                }
                if (this.item.state.isEdit == "lang") {
                    ;(this.$refs.inputLang as any)?.focus()
                }
                // console.log("this.$refs.input", this.item.state.isEdit, this.$refs.input)
                document.execCommand("selectAll", false)
            })
        },
        onClick(e: any): any {
            this.$emit("click", e)
        },
        onKeydown(e: KeyboardEvent) {
            if (e.key === "Enter") {
                this.doEditDone()
            }
        },
        onKeydownLang(e: KeyboardEvent) {
            if (e.key === "Enter") {
                this.doEditDone()
            }
        },
        onBlur() {
            this.doEditDone()
        },
        onBlurLang() {},
        async doEditDone() {
            // if (this.item.state.isEdit == "text") {
            //     await this.item.updateContent((this.$refs?.input as any)?.innerText)
            //     this.$emit("update")
            // } else if (this.item.state.isEdit == "lang") {
            //     this.item.data.word.langText = (this.$refs?.inputLang as any)?.innerText
            // }
            // this.item.state.isEdit = false
        },
    },
    computed: {
       
    },
})
</script>
