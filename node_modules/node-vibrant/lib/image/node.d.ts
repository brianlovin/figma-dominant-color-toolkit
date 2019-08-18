import { ImageData, ImageSource } from '../typing';
import { ImageBase } from './base';
export default class NodeImage extends ImageBase {
    private _image;
    private _loadByProtocolHandler;
    private _loadFromPath;
    private _loadByJimp;
    load(image: ImageSource): Promise<ImageBase>;
    clear(): void;
    update(imageData: ImageData): void;
    getWidth(): number;
    getHeight(): number;
    resize(targetWidth: number, targetHeight: number, ratio: number): void;
    getPixelCount(): number;
    getImageData(): ImageData;
    remove(): void;
}
