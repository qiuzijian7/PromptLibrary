import { IPromptWord,IPromptImage, PromptWordType } from "../Lib/parsePrompts/parsePrompts"
import { useDatabaseServer } from "../Lib/DatabaseServer/DatabaseServer"
import { chinesePercentage } from "../Lib/chinesePercentage"
import { translatePrompts } from "../Lib/translatePrompts"
import { stringFromUnit8Array } from "fzz"

export interface IPromptImageData {
    image: IPromptImage
    // 被禁用的
    disabled?: boolean
}

export class PromptImage {
    static fromWord(image: IPromptImage) {
        return new PromptImage({
            image: Object.assign(emptyWord(), image),
        })
    }
    static createEmpty(data: { text?: string; author?: string; link?: string; image?: string }) {
        return new PromptImage({
            image: <any>{
                ...emptyWord(),
                id: `${data.text},${Date.now()}`,
                author: data.author,
                link: data.link,
                image: data.image,
            },
        })
    }

    data!: IPromptImageData
    state = {
        isEdit: <false | "text" | "lang">false,
        isDict: false,
    }
    constructor(data?: IPromptImageData) {
        this.data = Object.assign({ disabled: false }, data)
    }

    /** 更新内容（检查分类、翻译） */
    async updateContent(text: string) {
        let dataserver = useDatabaseServer()
        let rawText = text
        // 命令
        let isCommand
        if (text.startsWith("--") || text.startsWith("—")) {
            text = text.split(" ")[0]
            isCommand = true
        }
        
        // 重置旧数据
        this.data.word.desc = undefined
        this.data.word.langText = undefined
        this.data.word.rawText = ""

        // 「中翻英」中文翻译成英文
        let cp = chinesePercentage(text)
        let isZhToEn
        if (!isCommand && cp > 50) {
            let re = await translatePrompts([text], { to: "en" })
            if (re?.[0]) {
                isZhToEn = true
                this.data.word.langText = text
                text = re[0]
                rawText = text
            }
        }

        this.data.word.text = text
        this.data.word.rawText = rawText

        let pDesc = (await dataserver.queryPromptsDefine([text]))?.[0]

        if (pDesc) {
            if (pDesc["lang_zh"]) this.data.word.langText = pDesc["lang_zh"]
            if (pDesc.desc) this.data.word.desc = pDesc.desc
            if (pDesc.subType) this.data.word.subType = pDesc.subType
        }

        console.log("[updateContent]", this.data.word.langText, cp)
        // 如果且没有进行中翻英，且文本是英文而且没有译文，进行「英翻中」
        if (!isZhToEn && !isCommand && !this.data.word.langText && cp < 5) {
            let re = await translatePrompts([text])
            if (re && re[0]) {
                this.data.word.langText = re[0]
            }
        }
    }
}

function emptyWord() {
    return {
        id: null,
        text: null,
        rawText: null,
        langText: null,
        type: PromptWordType.Word,
        group: null,
        subType: null,
        desc: null,
        args: [],
        lv: null,
        isEg: null,
    }
}
