import FrameSpan from "./FrameSpan"

export default class Composition {
    Name: string
    Frames: FrameSpan
    Split: number

    SplitFrameSpans = (): FrameSpan[] => this.Frames.Split(this.Split)

    constructor(name: string, frames: FrameSpan, split: number) {
        this.Name = name
        this.Frames = frames
        this.Split = split < 1 ? 1 : split
    }

    ToString(): string {
        return `Comp(${this.Name}, [${this.Frames.StartFrame}, ${this.Frames.EndFrame}], ${this.Split})`
    }
}