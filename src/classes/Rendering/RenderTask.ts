import OutputModule from "./OutputModule"
import RenderSettings from "./RenderSettings"
import Composition from "./Composition"
import { settings } from "../Settings"

export default class RenderTask {
    Project: string = ""
    Output: string = settings.Current.LastOutputPath
    OutputModule: OutputModule = settings.Current.OutputModules.Modules[settings.Current.OutputModules.Selected]
    RenderSettings: string = settings.Current.RenderSettings

    MissingFiles: boolean = settings.Current.MissingFiles
    Sound: boolean = settings.Current.Sound
    Multiprocessing: boolean = settings.Current.Multithreaded
    CustomProperties: string = settings.Current.CustomProperties

    CacheLimit: number = settings.Current.CacheLimit
    MemoryLimit: number = settings.Current.MemoryLimit

    Compositions: Array<Composition> = []

    constructor(project: string) {
        this.Project = project
    }
}