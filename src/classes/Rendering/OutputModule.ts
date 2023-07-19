export default class OutputModule {
    static Default = {
        Lossless: new OutputModule("Lossless", "[compName].[fileExtension]", false)
    }

    public Module: string;
    public Mask: string;
    public IsImported: Boolean;

    constructor(module: string, mask: string, isImported: Boolean) {
        this.Module = module;
        this.Mask = mask;
        this.IsImported = isImported;
    }
}