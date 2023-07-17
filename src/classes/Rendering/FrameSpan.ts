export default class FrameSpan {
    StartFrame: number
    EndFrame: number

    constructor(startFrame: number, endFrame: number) {
        this.StartFrame = startFrame
        this.EndFrame = endFrame
    }

    Split(count: number): Array<FrameSpan> {
        let result: FrameSpan[] = new Array<FrameSpan>(count);
        result[0].StartFrame = this.StartFrame;
        let j: number = this.EndFrame - this.StartFrame;
        let k: number = Math.floor(j / count);
        result[0].EndFrame = this.StartFrame + k;
      
        for (let i = 1; i < count; i++) {
          result[i].StartFrame = this.StartFrame + k * i + 1;
          result[i].EndFrame = this.StartFrame + k * (i + 1);
        }
      
        result[count - 1].EndFrame = this.EndFrame;
        return result;
    }

    ToString(): string {
        return `[${this.StartFrame}, ${this.EndFrame}]`;
    }
}