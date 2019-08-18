import { ImageSource, Options, ComputedOptions, Callback } from './typing';
import { Palette } from './color';
import Builder from './builder';
import * as Util from './util';
import * as Quantizer from './quantizer';
import * as Generator from './generator';
import * as Filters from './filter';
declare class Vibrant {
    private _src;
    static Builder: typeof Builder;
    static Quantizer: typeof Quantizer;
    static Generator: typeof Generator;
    static Filter: typeof Filters;
    static Util: typeof Util;
    static DefaultOpts: Partial<Options>;
    static from(src: ImageSource): Builder;
    opts: ComputedOptions;
    private _palette;
    constructor(_src: ImageSource, opts?: Partial<Options>);
    private _process;
    palette(): Palette;
    swatches(): Palette;
    getPalette(cb?: Callback<Palette>): Promise<Palette>;
}
export default Vibrant;
