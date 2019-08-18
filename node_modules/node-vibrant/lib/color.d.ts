import { Filter } from './typing';
export declare type Vec3 = [number, number, number];
export interface Palette {
    Vibrant?: Swatch;
    Muted?: Swatch;
    DarkVibrant?: Swatch;
    DarkMuted?: Swatch;
    LightVibrant?: Swatch;
    LightMuted?: Swatch;
    [name: string]: Swatch | undefined;
}
export declare class Swatch {
    static applyFilter(colors: Swatch[], f: Filter): Swatch[];
    private _hsl;
    private _rgb;
    private _yiq;
    private _population;
    private _hex;
    readonly r: number;
    readonly g: number;
    readonly b: number;
    readonly rgb: [number, number, number];
    readonly hsl: [number, number, number];
    readonly hex: string;
    readonly population: number;
    toJSON(): {
        rgb: [number, number, number];
        population: number;
    };
    getRgb(): Vec3;
    getHsl(): Vec3;
    getPopulation(): number;
    getHex(): string;
    private getYiq;
    private _titleTextColor;
    private _bodyTextColor;
    readonly titleTextColor: string;
    readonly bodyTextColor: string;
    getTitleTextColor(): string;
    getBodyTextColor(): string;
    constructor(rgb: Vec3, population: number);
}
