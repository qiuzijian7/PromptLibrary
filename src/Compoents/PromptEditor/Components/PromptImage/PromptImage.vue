<!-- Created on 2023/03/20 - 21:44 -->
<template>
    <div
        class="PromptImage"
        @click="onClick"
        @contextmenu.prevent="$emit('contextmenu', { el: $el, item, event: $event })"
        @mousedown="onMousedown"
        v-tooltip="{ content: item.data.word.desc, delay: 500 }"
    >
        <div class="content">
            <image src="item.data.image" alt="none">
               
            </image>
        </div>
    </div>
</template>
<style lang="scss">
.PromptImage {
    --h: 28px;
    color: #fff;
    box-shadow: 0 2px 2px #33364340;
    display: flex;
    margin: var(--padding-1);
    border-radius: var(--padding-1);
    font-size: var(--font-size-1);
    cursor: pointer;
    transition: all 0.2s ease;
    min-height: var(--h);
    position: relative;
    &:hover {
        transform: translateY(-1px);
        transition: all 0.2s ease-in-out;
        box-shadow: 0 3px 2px #33364340;
    }
    &:active {
        transform: translateY(0);
        transition: all 0.1s ease;
        box-shadow: 0 1px 2px #33364340;
    }
    &.disabled {
        opacity: 0.5;
        filter: saturate(0.5) brightness(0.8);
        box-shadow: none;
        &:hover {
            transform: translateY(0);
        }
    }
    .content {
        display: flex;
    }
    user-select: none;
    &.isEdit {
        user-select: text;
    }
    &.dnd-ghost {
        position: fixed;
        transition: none;
        z-index: 100;
        pointer-events: none;
    }
    &.dnd-org {
        opacity: 0;
        pointer-events: none;
        transform: none;
        &.dict-word {
            opacity: 0.5;
        }
    }

    .displayName {
        font-family: "JetBrains Mono", monospace;
        font-weight: 300;
        display: flex;
        place-items: flex-start;
    }
    .langName {
        text-shadow: 0 -1px #0000002b;
    }

    --bk: linear-gradient(#606060, #6c6c6c);
    --bk-desc: linear-gradient(#a0b181, #57b049);

    .name:first-child {
        display: inline-flex;
        padding: var(--padding-1) var(--padding-2);

        border-radius: var(--padding-1) 0 0 var(--padding-1);
        background: var(--bk);
    }
    .name:last-child {
        display: inline-flex;
        padding: var(--padding-1) var(--padding-2);

        border-radius: 0 var(--padding-1) var(--padding-1) 0;
        background: var(--bk-desc);
    }
    .name:first-child:last-child {
        border-radius: var(--padding-1);
        background: var(--bk);
    }
    // ----------------------
    .lv {
        background: #ffffff;
        color: #626262;
        padding: 0 6px;
        margin-left: 6px;
        border-radius: 2px;
        font-size: 12px;
        display: flex;
        align-items: center;
        font-weight: bold;
        font-family: sans-serif;
        text-shadow: 0 1px #2231561f;
        margin-top: 2px;
    }
    .input {
        height: 20px;
        padding: 0;
        color: #fff;
        display: flex;
        margin: 0;
        min-width: 10px;
    }

    // ---------------
    &:not(.dnd-org):not(.dnd-ghost) .dnd-slots {
        position: absolute;
        display: none;
        width: 100%;
        height: 100%;
        left: 0;
        top: 0;
        .dnd-slot-pre {
            position: absolute;
            left: -6px;
            top: 0;
            width: calc(50% + 8px);
            height: 100%;
            border-left: 4px solid #4dc178;
            opacity: 0;
            &:hover {
                opacity: 1;
            }
        }
        .dnd-slot-next {
            position: absolute;
            right: -6px;
            top: 0;
            width: calc(50% + 8px);
            height: 100%;
            border-right: 4px solid #4dc178;
            opacity: 0;
            &:hover {
                opacity: 1;
            }
        }
    }

    .link {
        display: none;
        position: absolute;
        right: -14px;
        top: -14px;
        background: linear-gradient(#285edb, #504f94);
        height: 24px;
        width: 24px;
        place-content: center;
        place-items: center;
        border-radius: 280px;
        box-shadow: 0 2px 4px rgba(86, 82, 199, 0.2392156863);
        box-shadow: 0 2px 2px rgba(51, 54, 67, 0.2509803922);
        font-size: 16px;
        transition: all 0.2s ease;
    }
    &:hover {
        .link {
            display: flex;

            &:hover {
                transform: scale(1.1);
            }
        }
    }
}

.dnd-ing {
    .dnd-slots {
        display: flex !important;
    }
    .PromptImage {
        &:hover {
            transform: none;
        }
    }
}

@import "./subType.scss";
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
            if (this.item.state.isEdit) return
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
