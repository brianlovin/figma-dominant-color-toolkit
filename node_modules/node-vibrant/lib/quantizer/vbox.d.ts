import { Vec3 } from '../color';
import { Pixels, Filter } from '../typing';
export interface Dimension {
    r1: number;
    r2: number;
    g1: number;
    g2: number;
    b1: number;
    b2: number;
    [d: string]: number;
}
export default class VBox {
    static build(pixels: Pixels, shouldIgnore?: Filter): VBox;
    dimension: Dimension;
    hist: Uint32Array;
    private _volume;
    private _avg;
    private _count;
    constructor(r1: number, r2: number, g1: number, g2: number, b1: number, b2: number, hist: Uint32Array);
    invalidate(): void;
    volume(): number;
    count(): number;
    clone(): VBox;
    avg(): Vec3;
    contains(rgb: Vec3): boolean;
    split(): VBox[];
}
