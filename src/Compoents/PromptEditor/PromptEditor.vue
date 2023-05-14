<template>
    <div class="PromptEditor">
        <div class="workspace">
            <PromptWork
                v-for="work in promptEditor.works"
                :prompt-work="work"
                :key="work.id"
                @delete="doDeletePromptWork"
            />
        </div>

    </div>
</template>
<style lang="scss">
.PromptEditor {
    position: relative;
    max-width: 1280px;
    margin: auto;
    height: 100vh;//auto;
    overflow-y: scroll;
    .debug {
        margin-top: 200px;
    }

    .operate-tool {
        margin: 20px;
        display: flex;
        gap: 6px;
        .checkbox {
            margin-left: 32px;
        }

        .server-select {
            display: flex;
            margin-left: auto;
            place-items: center;
            font-size: var(--font-size-1);
            color: #5a5a5a;
            .iconify {
                font-size: 1.2em;
                margin-right: 0.25em;
            }
            select {
                width: 130px;
            }
        }
    }
    .回血-box {
        position: absolute;
        bottom: -93px;
        left: 18px;
        img {
            height: 52px;
        }
    }
}
</style>
<script>
import { LOCAL_TRANSLATE_SERVER, PromptEditorClass } from "./PromptEditorClass"
import PromptWork from "./Components/PromptWork/PromptWork.vue"
import { dndInit } from "./Lib/DnD"
import { useClipboard } from "@vueuse/core"
let { copy } = useClipboard({ legacy: true })
export default {
    props: ["initPrompts"],
    data() {
        dndInit()
        let promptEditor = new PromptEditorClass({ initPrompts: this.initPrompts })
        return {
            LocalTrasnslateServer: LOCAL_TRANSLATE_SERVER,
            promptEditor,
            adDelay: false,
        }
    },
    components: { PromptWork },
    provide() {
        setTimeout(() => (this.adDelay = true), 500)
        return { PromptEditor: this }
    },
    watch: {
        "promptEditor.data.server": {
            immediate: true,
            handler(val) {
                globalThis.__OPS_SERVER = val
            },
        },
    },
    methods: {
        doAddWorkspace() {
            this.promptEditor.addWorkspace()
            setTimeout(() => {
                this.$refs["operate-tool"].scrollIntoView({
                    behavior: "smooth",
                })
            }, 100)
        },
        doCopyWorkspaceUrl() {
            let prompts = this.promptEditor.works.map((w) => w.exportPrompts())
            let q = encodeURIComponent(JSON.stringify(prompts))
            let url = `${location.origin + location.pathname}?prompts=${q}`
            copy(url)
        },

        doDeletePromptWork(promptWork) {
            this.promptEditor.removeWorkspace(promptWork)
        },
    },
    computed: {
        needShowAd() {
            if (this.adDelay && this.promptEditor.data.server?.startsWith("https://indexfs.moonvy.com")) {
                return true
            }
        },
    },
}
</script>
