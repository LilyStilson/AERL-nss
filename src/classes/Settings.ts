import { Composition, OutputModule, RenderTask } from "./Rendering"
import { fs, path } from "@tauri-apps/api"
import { tryParseBoolean, tryParseNumber } from "./Helpers/Functions"

import { invoke } from "@tauri-apps/api"
import { Platform } from "./Helpers/Platform"

import { MantineThemeComponents } from "@mantine/styles/lib/theme/types/MantineTheme"
import { Theme } from "./Helpers/Enums"
import { MantineTheme, useMantineTheme } from "@mantine/core"
import { Dispatch, SetStateAction } from "react"

export interface ISettingsProps {
    settings: [ISettingsObject, Dispatch<SetStateAction<ISettingsObject>>]
    onSettingsChanged?: (settings: ISettingsObject) => void
}

export interface ILauncherConfig {
    Language: string,
    Style: Theme,
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
        Modules: OutputModule[]
    },
    RenderSettings: string,
    RecentProjects: string[],
}

export interface ISettingsObject {
    System: {
        Memory: number,
        Cores: number,
    }
    Current: ILauncherConfig
}

export class SettingsSchema {
    static default(): ILauncherConfig {
        return {
            Language: "en-US",
            Style: Theme.Dark,
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

    static defaultObject(): ISettingsObject {
        return {
            System: {
                Memory: -1,
                Cores: -1,
            },
            Current: SettingsSchema.default()
        }
    }

    static fromJson(json: string): ILauncherConfig {
        return JSON.parse(json)
    }
}

// export class Settings {
//     isLoaded: boolean
//     Current: ILauncherConfig

//     System: {
//         Memory: number,
//         Cores: number,
//     } = {
//         Memory: -1,
//         Cores: -1,
//     }

//     theme?: MantineTheme

//     // settingsState = useState(this)

//     settingsObject: {
//         isLoaded: boolean,
//         Current: ILauncherConfig,
//         System: {
//             Memory: number,
//             Cores: number,
//         },
//         theme?: MantineTheme,
//     } | undefined

//     constructor() { 
//         this.isLoaded = false
//         this.Current = SettingsSchema.default()
//         this.theme = useMantineTheme()
//     }

//     static async settingsFilePath(): Promise<string> {
//         return await path.join(await path.appConfigDir(), "settings.json")
//     }

//     async init() {
//         this.System.Memory = await invoke("get_platform_memory")
//         this.System.Cores = await invoke("get_platform_cpu")
//         this.Current = SettingsSchema.default()
//         localStorage.clear()
//         console.debug("Settings.ts :: Settings initialized.")
//     }

//     async load() {
//         const settingsPath = await Settings.settingsFilePath()

//         if (await fs.exists(settingsPath)) {
//             let fileContents = await fs.readTextFile(settingsPath)
//             this.Current = SettingsSchema.fromJson(fileContents)
//             this.isLoaded = true
//         } else {
//             throw new Error("New settings file does not exist. Trying legacy...")
//         }  
//         console.debug("Settings.ts :: Settings loaded.")
//     }

//     async tryLoad(): Promise<boolean> {
//         try {
//             await this.load()
//             return true
//         } catch (e) {
//             return false
//         }
//     }

//     async loadLegacy() {
//         function legacyLangToLocale(lang: number): string {
//             switch (lang) {
//                 case 0: return "en-US"
//                 case 1: return "ru-RU"
//                 default: return "en-US"
//             }
//         }

//         const settingsPath = Platform.Windows
//             ? "C:\\ProgramData\\AErender\\AErenderConfiguration.xml"
//             : await path.join(await path.documentDir(), "AErender Launcher", "AErenderConfiguration.xml")

//         let fileContents = await fs.readTextFile(settingsPath)
//         let xml = new DOMParser().parseFromString(fileContents, "text/xml")

//         this.Current = {
//             Language: legacyLangToLocale(tryParseNumber(xml.getElementsByTagName("Language")[0].innerHTML) ?? 0),
//             Style: Theme.Dark,

//             AErenderPath: xml.getElementsByTagName("AErenderPath")[0].innerHTML,

//             DefaultProjectPath: xml.getElementsByTagName("DefaultProjectPath")[0].innerHTML,
//             DefaultOutputPath: xml.getElementsByTagName("DefaultOutputPath")[0].innerHTML,

//             LastProjectPath: xml.getElementsByTagName("LastProjectPath")[0].innerHTML,
//             LastOutputPath: xml.getElementsByTagName("LastOutputPath")[0].innerHTML,
//             TemporarySavePath: xml.getElementsByTagName("TemporarySavePath")[0].innerHTML,

//             MissingFiles: tryParseBoolean(xml.getElementsByTagName("MissingFiles")[0].innerHTML) ?? false,
//             Sound: tryParseBoolean(xml.getElementsByTagName("Sound")[0].innerHTML) ?? true,
//             Multithreaded: tryParseBoolean(xml.getElementsByTagName("Multithreaded")[0].innerHTML) ?? false,
//             CustomProperties: xml.getElementsByTagName("CustomProperties")[0].innerHTML,
//             MemoryLimit: tryParseNumber(xml.getElementsByTagName("MemoryLimit")[0].innerHTML) ?? 100,
//             CacheLimit: tryParseNumber(xml.getElementsByTagName("CacheLimit")[0].innerHTML) ?? 100,

//             OutputModules: {
//                 Selected: tryParseNumber(xml.getElementsByTagName("OutputModules")[0].innerHTML) ?? 0,
//                 Modules: [...xml.getElementsByTagName("OutputModules")[0].children].map((module) => new OutputModule(
//                     module.getElementsByTagName("Module")[0].innerHTML,
//                     module.getElementsByTagName("Mask")[0].innerHTML,
//                     tryParseBoolean(module.attributes.getNamedItem("Imported")?.value ?? "False") ?? false
//                 ))
//             },
//             RenderSettings: "Best Settings",
//             RecentProjects: [...xml.getElementsByTagName("RecentProjects")[0].children].map((project) => project.innerHTML).filter((project) => project !== "(empty)"),
//         }
//         this.isLoaded = true
//         console.debug("Settings.ts :: Settings loaded from legacy file.")
//     }

//     async tryLoadLegacy(): Promise<boolean> {
//         try {
//             await this.loadLegacy()
//             this.save()
//             return true
//         } catch (e) {
//             return false
//         }
//     }

//     async save() {
//         const settingsPath = await Settings.settingsFilePath()

//         const settingsDir = await path.dirname(settingsPath)

//         if (!await fs.exists(settingsDir)) 
//             await fs.createDir(settingsDir, { recursive: true })

//         await fs.writeTextFile(settingsPath, JSON.stringify(this.Current, undefined, 4))

//         console.debug("Settings.ts :: Saved settings to file.")
//     }

//     updateSettings(settings: ILauncherConfig): Settings {
//         this.Current = settings
//         console.warn("Settings.ts :: Spread settings", {...this})
//         return { ...this }
//     }

//     setOutputModules(modules: OutputModule[]): Settings {
//         return this.updateSettings({
//             ...this.Current,
//             OutputModules: {
//                 ...this.Current.OutputModules,
//                 Modules: modules
//             }
//         })
//     }

//     setRenderSettings(settings: string): Settings {
//         return this.updateSettings({
//             ...this.Current,
//             RenderSettings: settings
//         })
//     }

//     createDefaultRenderTask(project: string): RenderTask {
//         return {
//             Project: project,
//             Output: this.Current.LastOutputPath,
//             OutputModule: this.Current.OutputModules.Modules[this.Current.OutputModules.Selected],
//             RenderSettings: this.Current.RenderSettings,
        
//             MissingFiles: this.Current.MissingFiles,
//             Sound: this.Current.Sound,
//             Multiprocessing: this.Current.Multithreaded,
//             CustomProperties: this.Current.CustomProperties,
        
//             CacheLimit: this.Current.CacheLimit,
//             MemoryLimit: this.Current.MemoryLimit,
        
//             Compositions: new Array<Composition>(),
//         }
//     }

// }


export async function settingsFilePath(): Promise<string> {
    return await path.join(await path.appConfigDir(), "settings.json")
}

export const Settings = {
    async init(): Promise<ISettingsObject> {
        return {
            System: {
                Memory: await invoke("get_platform_memory"),
                Cores: await invoke("get_platform_cpu"),
            },
            Current: SettingsSchema.default()
        }
    },
    async load(settings: ISettingsObject): Promise<ISettingsObject> {
        const settingsPath = await settingsFilePath()

        if (await fs.exists(settingsPath)) {
            let fileContents = await fs.readTextFile(settingsPath)
            return {
                ...settings,
                Current: SettingsSchema.fromJson(fileContents)
            }
        } else {
            throw new Error("New settings file does not exist")
        }  
    },
    async loadLegacy(settings: ISettingsObject): Promise<ISettingsObject> {
        function legacyLangToLocale(lang: number): string {
            switch (lang) {
                case 0: return "en-US"
                case 1: return "ru-RU"
                default: return "en-US"
            }
        }

        const settingsPath = Platform.Windows
            ? "C:\\ProgramData\\AErender\\AErenderConfiguration.xml"
            : await path.join(await path.documentDir(), "AErender Launcher", "AErenderConfiguration.xml")

        let fileContents = await fs.readTextFile(settingsPath)
        let xml = new DOMParser().parseFromString(fileContents, "text/xml")

        return {
            ...settings,
            Current: {
                Language: legacyLangToLocale(tryParseNumber(xml.getElementsByTagName("Language")[0].innerHTML) ?? 0),
                Style: Theme.Dark,

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
        }
    },
    async save(settings: ISettingsObject) {
        const settingsPath = await settingsFilePath()

        const settingsDir = await path.dirname(settingsPath)

        if (!await fs.exists(settingsDir)) 
            await fs.createDir(settingsDir, { recursive: true })

        await fs.writeTextFile(settingsPath, JSON.stringify(settings.Current, undefined, 4))
    },
    createDefaultRenderTask(settings: ISettingsObject, project: string): RenderTask {
        return {
            Project: project,
            Output: settings.Current.LastOutputPath,
            OutputModule: settings.Current.OutputModules.Modules[settings.Current.OutputModules.Selected],
            RenderSettings: settings.Current.RenderSettings,
        
            MissingFiles: settings.Current.MissingFiles,
            Sound: settings.Current.Sound,
            Multiprocessing: settings.Current.Multithreaded,
            CustomProperties: settings.Current.CustomProperties,
        
            CacheLimit: settings.Current.CacheLimit,
            MemoryLimit: settings.Current.MemoryLimit,
        
            Compositions: new Array<Composition>(),
        }
    },
    updateSettings(settings: ISettingsObject, newSettings: ILauncherConfig): ISettingsObject {
        return {
            ...settings,
            Current: newSettings
        }
    },
}