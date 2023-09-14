import OutputModule from "./OutputModule"
import RenderSettings from "./RenderSettings"
import Composition from "./Composition"

export default class RenderTask {
    Project: string = ""
    Output: string = ""
    OutputModule: OutputModule = OutputModule.Default.Lossless
    RenderSettings: string = RenderSettings.Default.BestSettings

    MissingFiles: boolean = false
    Sound: boolean = true
    Multiprocessing: boolean = false
    CustomProperties: string = ""

    CacheLimit: number = 100
    MemoryLimit: number = 100

    Compositions: Array<Composition> = []

    constructor(project: string) {
        this.Project = project
    }
}