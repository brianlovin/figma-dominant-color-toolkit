import { Vec3 } from './color';
export declare const DELTAE94_DIFF_STATUS: {
    NA: number;
    PERFECT: number;
    CLOSE: number;
    GOOD: number;
    SIMILAR: number;
};
export declare const SIGBITS = 5;
export declare const RSHIFT: number;
export interface IndexedObject {
    [key: string]: any;
}
export interface DeferredPromise<R> {
    resolve: (thenableOrResult: R | PromiseLike<R>) => void;
    reject: (error: any) => void;
    promise: Promise<R>;
}
export declare function defer<R>(): DeferredPromise<R>;
export declare function hexToRgb(hex: string): Vec3;
export declare function rgbToHex(r: number, g: number, b: number): string;
export declare function rgbToHsl(r: number, g: number, b: number): Vec3;
export declare function hslToRgb(h: number, s: number, l: number): Vec3;
export declare function rgbToXyz(r: number, g: number, b: number): Vec3;
export declare function xyzToCIELab(x: number, y: number, z: number): Vec3;
export declare function rgbToCIELab(r: number, g: number, b: number): Vec3;
export declare function deltaE94(lab1: Vec3, lab2: Vec3): number;
export declare function rgbDiff(rgb1: Vec3, rgb2: Vec3): number;
export declare function hexDiff(hex1: string, hex2: string): number;
export declare function getColorDiffStatus(d: number): string;
export declare function getColorIndex(r: number, g: number, b: number): number;
