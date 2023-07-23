export default class RenderSettings {
    static Default = {
        BestSettings         : "Best Settings",
        CurrentSettings      : "Current Settings",
        DVSettings           : "DV Settings",
        DraftSettings        : "Draft Settings",
        MultiMachineSettings : "Multi-Machine Settings"
    }

    static GeneratedDefault: string[] = Object.keys(this.Default).map((_, idx) => Object.values(this.Default)[idx])
}