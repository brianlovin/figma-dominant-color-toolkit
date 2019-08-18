import { Filter, Image, Options, ImageData, ImageSource } from '../typing';
export declare abstract class ImageBase implements Image {
    abstract load(image: ImageSource): Promise<ImageBase>;
    abstract clear(): void;
    abstract update(imageData: ImageData): void;
    abstract getWidth(): number;
    abstract getHeight(): number;
    abstract resize(targetWidth: number, targetHeight: number, ratio: number): void;
    abstract getPixelCount(): number;
    abstract getImageData(): ImageData;
    abstract remove(): void;
    scaleDown(opts: Options): void;
    applyFilter(filter: Filter): Promise<ImageData>;
}
