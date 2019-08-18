import { Callback, ImageClass, ImageSource, Options, Filter, Quantizer, Generator } from './typing';
import { Palette } from './color';
import Vibrant from './vibrant';
export default class Builder {
    private _src;
    private _opts;
    constructor(src: ImageSource, opts?: Partial<Options>);
    maxColorCount(n: number): Builder;
    maxDimension(d: number): Builder;
    addFilter(f: Filter): Builder;
    removeFilter(f: Filter): Builder;
    clearFilters(): Builder;
    quality(q: number): Builder;
    useImageClass(imageClass: ImageClass): Builder;
    useGenerator(generator: Generator): Builder;
    useQuantizer(quantizer: Quantizer): Builder;
    build(): Vibrant;
    getPalette(cb?: Callback<Palette>): Promise<Palette>;
    getSwatches(cb?: Callback<Palette>): Promise<Palette>;
}
