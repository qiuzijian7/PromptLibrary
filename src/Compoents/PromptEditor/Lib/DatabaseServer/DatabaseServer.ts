import { fetchFromNotion } from "./lib/fetchFromNotion"

export interface IPromptDefineItem {
    text: string
    subType?: string
    desc?: string
    dir?: string
    lang_zh?: string
    sampleCmds?: string[]
    isAlias?: boolean
    tags?: string
    image?:string
    weblink?:string
    prompt?:string
    author?:string
    platform?:string
    property?:string
    
}

export class DatabaseServer {
    localPromptDefineMap: { [key: string]: IPromptDefineItem } = {}
    localPrefabDefineMap: { [key: string]: IPromptDefineItem } = {}
    notionPromptDefineMap: { [key: string]: IPromptDefineItem } = {}
    notionPrefabDefineMap: { [key: string]: IPromptDefineItem } = {}
    isReady: null | Promise<boolean> = null
    constructor() {}
    async ready() {
        if (this.isReady != null) return this.isReady
        this.isReady = this.init()
        return this.isReady
    }
    async init() {
        // localJson
        let localPromptDescMap = await (await fetch("./localPromptDefineMap.json")).json()
        let localPrefabDescMap = await (await fetch("./localPrefabDefineMap.json")).json()
        // console.log('localPromptDescMap',localPromptDescMap)
        this.localPromptDefineMap = localPromptDescMap
        this.localPrefabDefineMap = localPrefabDescMap
        return true
    }
    async queryPromptsDefine(prompts: string[]): Promise<IPromptDefineItem[]> {
        await this.ready()
        let reuslt = []
        for (let prompt of prompts) {
            let re = this.localPromptDefineMap[prompt?.toLowerCase()]
            if (re) {
                reuslt.push(re)
            } else {
                reuslt.push(null)
            }
        }
        return <any>reuslt
    }

    async getPromptsDefine(options?: { onlyMyNotion?: boolean }) {
        await this.ready()
        if (options?.onlyMyNotion) {
            return this.notionPromptDefineMap
        } else {
            return this.localPromptDefineMap
        }
    }
    async getPrefabsDefine(options?: { onlyMyNotion?: boolean })
    {
        await this.ready()
        if (options?.onlyMyNotion) {
            return this.notionPrefabDefineMap
        } else {
            return this.localPrefabDefineMap
        }
    }

    async fetchNotion(options: { apiKey: string; databaseId: string }) {
        console.log("fetchNotion options", options)
        let { defineMap, me } = await fetchFromNotion(options)
        this.notionPromptDefineMap = defineMap
        Object.assign(this.localPromptDefineMap, defineMap)
        return { defineMap, me }
    }
}

let databaseServer: DatabaseServer
export function useDatabaseServer() {
    if (!databaseServer) databaseServer = new DatabaseServer()
    return databaseServer
}
