<!-- Created on 2023/03/31 - 12:10 -->
<template>
    <div class="PromptDict">
        <div class="notion-settings" :class="{ isHoverButton }">
            <button
                class="notion-me"
                @click="doGotoNotionMe"
                @mousemove="setNotionHover(true)"
                @mouseleave="setNotionHover(false)"
            >
                <Icon icon="logos:notion-icon" />
                {{ notionName ?? (loading ? "连接中..." : "连接我的 Notion") }}
            </button>

            <div class="notion-config">
                <div class="help">
                    <Icon icon="ant-design:question-circle-outlined" />
                    <a
                        target="_blank"
                        href="https://github.com/Moonvy/OpenPromptStudio#2-%E5%88%9B%E5%BB%BA%E8%87%AA%E5%B7%B1%E7%9A%84-noiton-%E9%9B%86%E6%88%90%E6%8F%92%E4%BB%B6integrations"
                        >使用方法</a
                    >
                </div>
                <div class="line checkbox">
                    <label for="enableNotion">启用我的 Notion</label>
                    <input id="enableNotion" v-model="enableMyNotion" type="checkbox" />
                </div>
                <div class="line"><label>Integration Token</label> <input v-model="apiKey" type="text" /></div>
                <div class="line" v-tooltip="databaseId">
                    <label>Database ID </label> <input v-model="input_databaseId" type="text" />
                </div>

                <div class="line checkbox">
                    <label for="onlyMyNotion">仅使用此数据库 </label>
                    <input id="onlyMyNotion" v-model="onlyMyNotion" type="checkbox" />
                    <div class="desc">忽略默认词典</div>
                </div>
                <div class="line buttons">
                    <button
                        class="full"
                        :class="{ disabled: !notioConfigActive || loading || !enableMyNotion }"
                        @click="reloadData()"
                    >
                        {{ loading ? "载入中..." : "载入" }}
                    </button>
                </div>
            </div>
        </div>

        <header>
            <div class="dir-buttons" >
                <button v-for="curCategory in categorys" :class="{ active: curCategory == activeCategory }" @click="doChangeActiveCategory(curCategory)">
                    {{ curCategory }}
                </button>
            </div>
            <div  v-if="dict && activeCategory == '词典'">
                <template v-for="dir in dict">
                    <input type="radio" :id="dir.name" :value="dir" v-model="activeDir" v-on:click="doChangeActiveDir(dir)"> 
                    <label :for="dir.name">{{dir.name}}  </label>
                </template>
            </div>
            <div  v-if="tagPrefabMap && activeCategory == '预设'">
                <template   v-for="(prefabIndexs,tag) in tagPrefabMap">
                    <input type="checkbox" :id="tag" :value="tagMap[tag]" v-model="activeTags"> 
                    <label :for="tag">{{tagMap[tag]}}  </label>
                </template>
            </div>
            
        </header>

        <div class="active-dir" v-if="activeDir  && activeCategory == '词典'">
            <details class="sub-dir" v-for="subDir in activeSubDirs" open :key="subDir.name">
                <summary class="name" v-show="subDir.name != activeDir.name">
                    <span class="title">{{ subDir.name }}</span>
                    <span class="len">{{ subDir.words.length }}</span>
                </summary>
                <div class="list">
                    <div class="item" v-for="word in subDir.words">
                        <PromptItem :item="word" @click="doApplyWord(word)" class="dict-word" />
                    </div>
                </div>
            </details>
        </div>
       
        <div class="active-dir" v-if="activeTags && activeCategory == '预设'">
            <div class="list">
                
                <div v-for="(prefabItem,Index) in getImages">
                    <PromptImage :item="prefabItem" @click="doApplyPrefab(prefabItem)"/> 
                </div>  
            </div>
      
        </div>
    
    </div>
</template>
<style lang="scss">
.PromptDict {
    padding: 0 20px;
    display: flex;
    flex-direction: column;
    overflow: hidden;
    //width: 500px;
    .dir-buttons {
        display: flex;
        flex-wrap: wrap;
        margin: 0 4px;
        margin-bottom: 12px;
        padding: 0;
        border-radius: 4px;
        overflow: hidden;
        height: auto;
        flex: none;
        width: auto;
        background: #d5d7ef;
        button {
            background: #d5d7ef;
            color: #4545b2;
            border-radius: 0;
            flex: auto;
            min-width: 72px;
            white-space: nowrap;
            place-content: center;
            &.active {
                background: #4545b2;
                color: #d5d7ef;
                text-shadow: 0 1px 1px rgb(49 52 88);
            }
        }
    }
    .dir-radio{

    }
    .active-dir {
        height: 100vh;//auto;
        overflow-y: scroll;

        .sub-dir > .name {
            padding: 12px 0;
            font-size: 14px;
            font-weight: bold;
            color: #7e7e7e;
            text-shadow: 0 1px rgba(255, 255, 255, 0.4901960784);
            cursor: pointer;
            user-select: none;
            > .title {
                padding-left: 6px;
            }
            > .len {
                background: #e6e6e6;
                color: #7e7e7eb0;
                border-radius: 4px;
                padding: 1px 8px;
                margin-left: 4px;
                text-align: center;
                display: inline-flex;
                place-content: center;
                font-size: 12px;
                font-weight: normal;
                font-family: "JetBrains Mono";
            }

            &::marker {
                color: rgba(126, 126, 126, 0.5);
            }
        }
        .sub-prefab > .name {
            padding: 12px 0;
            font-size: 14px;
            font-weight: bold;
            color: #7e7e7e;
            text-shadow: 0 1px rgba(255, 255, 255, 0.4901960784);
            cursor: pointer;
            user-select: none;
            > .title {
                padding-left: 6px;
            }
            > .len {
                background: #e6e6e6;
                color: #7e7e7eb0;
                border-radius: 4px;
                padding: 1px 8px;
                margin-left: 4px;
                text-align: center;
                display: inline-flex;
                place-content: center;
                font-size: 12px;
                font-weight: normal;
                font-family: "JetBrains Mono";
            }

            &::marker {
                color: rgba(126, 126, 126, 0.5);
            }
        }
        .list {
            display: flex;
            flex-wrap: wrap;
        }
        &::-webkit-scrollbar {
            width: 12px;
            height: 12px;
            background-color: #aaa0;
        }
        &::-webkit-scrollbar-thumb {
            background: #838383;
            border-radius: 29px;
            border: 2px solid #e9e9e9;
        }
    }

    .notion-settings {
        .notion-me {
            position: absolute;
            right: 57px;
            top: 14px;
            font-size: 13px;
            z-index: 222;
            height: 32px;
        }

        .notion-config {
            opacity: 0;
            right: 54px;
            top: 11px;
            /* padding-top: 100px; */
            width: 420px;
            height: auto;
            background: #ffffff;
            position: absolute;
            z-index: 100;
            padding: 20px;
            padding-top: 49px;
            border-radius: 4px;
            box-shadow: -2px 0 64px rgba(6, 5, 73, 0.1215686275);
            transition: all 0.2s ease;
            pointer-events: none;
            .line:not(:last-child) {
                margin-bottom: 8px;
            }
            .help {
                color: #4b4894;
                position: absolute;
                top: 12px;
                display: flex;
                place-items: center;
                .iconify {
                    margin-right: 4px;
                }
                a {
                    font-weight: bold;
                }
            }
            a {
                font-size: 13px;
                color: #4b4894;
                text-decoration: none;
                &:hover {
                    color: #4545b2;
                    text-decoration: underline;
                }
            }
            label {
                display: inline-flex;
                font-size: 13px;
                color: #5a5a5a;
                width: 140px;
                place-content: flex-end;
                white-space: nowrap;
                margin-right: 12px;
            }

            input {
                background: #e9e9e975;
                width: auto;
                flex: auto;
            }

            .full {
                width: auto;
                flex: auto;
                place-content: center;
            }

            .line {
                display: flex;
                place-items: center;
                place-content: flex-start;
            }

            .line.checkbox {
                input {
                    flex: none;
                }
            }
            .desc {
                flex: auto;
                font-size: 13px;
                color: #c9c9c9;
                text-align: right;
            }
            .buttons {
                place-content: center;

                button.disabled {
                    pointer-events: none;
                    opacity: 0.5;
                }
            }
        }

        &.isHoverButton:hover .notion-config,
        .notion-config:hover {
            transition: all 0.2s ease;
            opacity: 1;
            pointer-events: auto;
        }
    }
    .scroll-container {
        display: block;
        width: 350px;
        height: 200px;
        overflow-y: scroll;
        scroll-behavior: smooth;
    }
}
</style>
<script>
import { getDictData ,getPrefabData} from "./getDictData"
import vPromptItem from "../../Compoents/PromptEditor/Components/PromptItem/PromptItem.vue"
import vPromptImage from "../../Compoents/PromptEditor/Components/PromptImage/PromptImage.vue"
import { useDatabaseServer } from "../PromptEditor/Lib/DatabaseServer/DatabaseServer"
import { useStorage } from "@vueuse/core"
import { debounce } from "lodash"

const apiKey = useStorage("ops-notion-apiKey", "")
const databaseId = useStorage("ops-notion-databaseId", "")
const onlyMyNotion = useStorage("ops-notion-onlyMyNotion", false)
const enableMyNotion = useStorage("ops-notion-enableMyNotion", true)

export default {
    data() {
        return {
            categorys: ['词典','预设'],
            activeCategory:"词典",
            dict: null,
            tagPrefabMap: null,
            tagMap: null,
            prefabMap: null,
            activeTags: [],
            activeDir: null,
            apiKey,
            databaseId,
            input_databaseId: databaseId.value,
            onlyMyNotion,
            enableMyNotion,
            notionName: null,
            notionUrl: null,
            loading: false,
            isHoverButton: false,
        }
    },
    watch: {
        input_databaseId: {
            handler(val) {
                if (val.startsWith("https://")) {
                    let re = /\/([0-9a-f]{32})/.exec(val)
                    if (re?.[1]?.length == 32) {
                        let databaseId = re?.[1]
                        console.log("found databaseId", databaseId, re)
                        this.input_databaseId = databaseId
                    } else {
                        this.input_databaseId = ""
                    }
                } else {
                    if (val && val.length != 32) {
                        this.input_databaseId = ""
                    }
                }
                this.databaseId = val
            },
        },
    },
    created() {
        this.loadData()
        let databaseServer = useDatabaseServer()
        console.log("[PromptDict]", this, databaseServer)
        if (this.notioConfigActive) {
            this.reloadData()
        }
    },
    methods: {
        loadData() {
            getDictData(onlyMyNotion.value).then((dict) => {
                this.dict = dict
                this.activeDir = dict[0]
            })
            getPrefabData(onlyMyNotion.value).then(([tagPrefabMap,tagMap,prefabMap]) => {
                this.tagPrefabMap = tagPrefabMap
                this.tagMap = tagMap
                this.prefabMap = prefabMap
                this.activeTags = [tagMap[0]]
            })
        },

        async reloadData() {
            if (enableMyNotion.value) {
                await this.fetchNotion()
            }
            this.loadData()
        },

        async fetchNotion() {
            try {
                console.log("[Notion] fetchNotion")
                this.loading = true
                this.notionName = null
                this.notionUrl = null
                let databaseServer = useDatabaseServer()
                let re = await databaseServer.fetchNotion({
                    apiKey: apiKey.value,
                    databaseId: databaseId.value,
                })
                this.notionName = re?.me?.name
                this.notionUrl = re?.me?.url
            } catch (e) {
                console.error("[Notion]", e)
                if (/Make sure the relevant pages and databases are shared with your integration/.test(e.message)) {
                    alert(`Notion 连接错误：` + e)
                } else {
                    alert(
                        `Notion 连接错误：没有 Notion 数据库的访问权限。请在此 Notion 数据库页面菜单的 'Connections' 中添加你的集成应用`
                    )
                }
            } finally {
                this.loading = false
            }
        },

        async doApplyWord(item) {
            let activeInputEl = document.body.querySelector(".PromptWork.active")
            if (!activeInputEl) activeInputEl = document.body.querySelector(".PromptWork")
            // console.log("activeInputEl", activeInputEl)

            if (activeInputEl) {
                let insertText = item.data.word.rawText ?? item.data.word.text
                let vueIns = activeInputEl.__vue__
                await vueIns.promptWork.reflowPrompts(insertText)
                vueIns.doExportPrompt()
            }
        },
        async doApplyPrefab(item) {
            let activeInputEl = document.body.querySelector(".PromptWork.active")
            if (!activeInputEl) activeInputEl = document.body.querySelector(".PromptWork")
            if (activeInputEl) {
                for (const element of item.words) {
                    let insertText = element.data.word.rawText ?? element.data.word.text
                    let vueIns = activeInputEl.__vue__
                    await vueIns.promptWork.reflowPrompts(insertText)
                    vueIns.doExportPrompt()
                }
            }
        },

        doChangeActiveDir(dir) {
            this.activeDir = dir
        },
        doChangeActivePrefabTag(prefabTagName) {
            this.activeTags = prefabIndexs
        },
        doChangeActiveCategory(curCategory) {
            this.activeCategory = curCategory
        },

        doGotoNotionMe() {
            if (this.notionUrl) window.open(this.notionUrl)
        },

        setNotionHover: debounce(function (v) {
            this.isHoverButton = v
        }, 400),
    },
    components: { 
        PromptItem: vPromptItem ,
        PromptImage: vPromptImage 
        },

    computed: {
        activeSubDirs() {
            if (this.activeDir) {
                return [this.activeDir, ...this.activeDir.children]
            }
        },
        activePrefabs() {
            if (this.activeTags) {
                let displayPrefabs=[]
                for(let prefabIndex in this.activeTags)
                {
                    displayPrefabs.push(this.prefabMap[prefabIndex])
                }
                return displayPrefabs
            }
        },
        getImages()
        {
            let prefabTagName;
            let items = new Set();
            let tagIndex = 0;

            for(let tagName of this.activeTags)
            {
                tagIndex = this.tagMap.indexOf(tagName);
                if(tagIndex != -1)
                {
                   let prefabIndexs = this.tagPrefabMap[tagIndex];
                    for(let prefabIndex of prefabIndexs)
                    {
                        items.add(this.prefabMap[prefabIndex]);
                    }
                }
            
            }
            
            return Array.from(items);
        },

        notioConfigActive() {
            return !!(this.databaseId && this.apiKey)
        },
    },
}
</script>
