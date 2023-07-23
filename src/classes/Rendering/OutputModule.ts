export default class OutputModule {
    static Default = {
        Lossless:               new OutputModule("Lossless",                    "[compName].[fileExtension]",           false),
        AIFF_48kHz:             new OutputModule("AIFF 48kHz",                  "[compName].[fileExtension]",           false),
        AlphaOnly:              new OutputModule("Alpha Only",                  "[compName].[fileExtension]",           false),
        AVI_DV_NTSC_48kHz:      new OutputModule("AVI DV NTSC 48kHz",           "[compName].[fileExtension]",           false),
        AVI_DV_PAL_48kHz:       new OutputModule("AVI DV PAL 48kHz",            "[compName].[fileExtension]",           false),
        LosslessWithAlpha:      new OutputModule("Lossless With Alpha",         "[compName].[fileExtension]",           false),
        MultiMachineSequence:   new OutputModule("Multi-Machine Sequence",      "[compName]_[#####].[fileExtension]",   false),
        Photoshop:              new OutputModule("Photoshop",                   "[compName]_[#####].[fileExtension]",   false),
        SaveCurrentPreview:     new OutputModule("Save Current Preview",        "[compName].[fileExtension]",           false),
        TIFFSequenceWithAlpha:  new OutputModule("TIFF Sequence With Alpha",    "[compName]_[#####].[fileExtension]",   false),
    }

    static GeneratedDefault: OutputModule[] = Object.keys(this.Default).map((_, idx) => Object.values(this.Default)[idx])

    public Module: string;
    public Mask: string;
    public IsImported: Boolean;

    constructor(module: string, mask: string, isImported: Boolean) {
        this.Module = module;
        this.Mask = mask;
        this.IsImported = isImported;
    }
}