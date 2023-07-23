import { OutputModule } from "./Rendering"
import { fs, path } from "@tauri-apps/api"
import { tryParseBoolean, tryParseNumber } from "./Helpers/Functions"

import { invoke } from "@tauri-apps/api"
import { Platform } from "./Helpers/Platform"

interface ILauncherConfig {
    Language: number,
    Style: number,
    AErenderPath: string,
    DefaultProjectPath: string,
    DefaultOutputPath: string,
    LastProjectPath: string,
    LastOutputPath: string,
    TemporarySavePath: string,
    MissingFiles: boolean,
    Sound: boolean,
    Multithreaded: boolean,
    CustomProperties: string,
    MemoryLimit: number,
    CacheLimit: number,
    OutputModules: {
        Selected: number,
        Modules: OutputModule[],
    },
    RenderSettings: string,
    RecentProjects: string[],
}

class SettingsSchema {
    static default(): ILauncherConfig {
        return {
            Language: 0,
            Style: 0,
            AErenderPath: "",
            DefaultProjectPath: "",
            DefaultOutputPath: "",
            LastProjectPath: "",
            LastOutputPath: "",
            TemporarySavePath: "",
            MissingFiles: false,
            Sound: true,
            Multithreaded: false,
            CustomProperties: "",
            MemoryLimit: 100,
            CacheLimit: 100,
            OutputModules: {
                Selected: 0,
                Modules: OutputModule.GeneratedDefault,
            },
            RenderSettings: "Best Settings",
            RecentProjects: []
        }
    }

    static fromJson(json: string): ILauncherConfig {
        return JSON.parse(json)
    }
}

export class Settings {
    isLoaded: boolean
    Current: ILauncherConfig

    System: {
        Memory: number,
        Cores: number,
    } = {
        Memory: -1,
        Cores: -1,
    }

    constructor() { 
        this.isLoaded = false
        this.Current = SettingsSchema.default()
    }

    static async settingsFilePath(): Promise<string> {
        return await path.join(await path.appConfigDir(), "settings.json")
    }

    async init() {
        this.System.Memory = await invoke("get_platform_memory")
        this.System.Cores = await invoke("get_platform_cpu")
        this.Current = SettingsSchema.default()
    }

    async reset() {
        this.Current = SettingsSchema.default()
        await this.save()
    }

    async load() {
        const settingsPath = await Settings.settingsFilePath()

        if (await fs.exists(settingsPath)) {
            let fileContents = await fs.readTextFile(settingsPath)
            this.Current = SettingsSchema.fromJson(fileContents)
            this.isLoaded = true
        } else {
            throw new Error("New settings file does not exist. Trying legacy...")
        }
        
    }

    async tryLoad(): Promise<boolean> {
        try {
            await this.load()
            return true
        } catch (e) {
            return false
        }
    }

    async loadLegacy() {
        const settingsPath = Platform.Windows
            ? "C:\\ProgramData\\AErender\\AErenderConfiguration.xml"
            : await path.join(await path.documentDir(), "AErender Launcher", "AErenderConfiguration.xml")

        let fileContents = await fs.readTextFile(settingsPath)
        let xml = new DOMParser().parseFromString(fileContents, "text/xml")

        this.Current = {
            Language: tryParseNumber(xml.getElementsByTagName("Language")[0].innerHTML) ?? 0,
            Style: tryParseNumber(xml.getElementsByTagName("Language")[0].innerHTML) ?? 0,

            AErenderPath: xml.getElementsByTagName("AErenderPath")[0].innerHTML,

            DefaultProjectPath: xml.getElementsByTagName("DefaultProjectPath")[0].innerHTML,
            DefaultOutputPath: xml.getElementsByTagName("DefaultOutputPath")[0].innerHTML,

            LastProjectPath: xml.getElementsByTagName("LastProjectPath")[0].innerHTML,
            LastOutputPath: xml.getElementsByTagName("LastOutputPath")[0].innerHTML,
            TemporarySavePath: xml.getElementsByTagName("TemporarySavePath")[0].innerHTML,

            MissingFiles: tryParseBoolean(xml.getElementsByTagName("MissingFiles")[0].innerHTML) ?? false,
            Sound: tryParseBoolean(xml.getElementsByTagName("Sound")[0].innerHTML) ?? true,
            Multithreaded: tryParseBoolean(xml.getElementsByTagName("Multithreaded")[0].innerHTML) ?? false,
            CustomProperties: xml.getElementsByTagName("CustomProperties")[0].innerHTML,
            MemoryLimit: tryParseNumber(xml.getElementsByTagName("MemoryLimit")[0].innerHTML) ?? 100,
            CacheLimit: tryParseNumber(xml.getElementsByTagName("CacheLimit")[0].innerHTML) ?? 100,

            OutputModules: {
                Selected: tryParseNumber(xml.getElementsByTagName("OutputModules")[0].innerHTML) ?? 0,
                Modules: [...xml.getElementsByTagName("OutputModules")[0].children].map((module) => new OutputModule(
                    module.getElementsByTagName("Module")[0].innerHTML,
                    module.getElementsByTagName("Mask")[0].innerHTML,
                    tryParseBoolean(module.attributes.getNamedItem("Imported")?.value ?? "False") ?? false
                ))
            },
            RenderSettings: "Best Settings",
            RecentProjects: [...xml.getElementsByTagName("RecentProjects")[0].children].map((project) => project.innerHTML).filter((project) => project !== "(empty)"),
        }
        this.isLoaded = true
    }

    async tryLoadLegacy(): Promise<boolean> {
        try {
            await this.loadLegacy()
            this.save()
            return true
        } catch (e) {
            return false
        }
    }

    async save() {
        const settingsPath = await Settings.settingsFilePath()

        const settingsDir = await path.dirname(settingsPath)

        if (!await fs.exists(settingsDir)) 
            await fs.createDir(settingsDir, { recursive: true })

        await fs.writeTextFile(settingsPath, JSON.stringify(this.Current))
    }

}

let settings = new Settings()
export default settings