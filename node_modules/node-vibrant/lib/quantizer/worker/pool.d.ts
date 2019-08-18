import { Swatch } from '../../color';
import { Pixels, ComputedOptions } from '../../typing';
export default class WorkerPool {
    private static _instance;
    private static _task_id;
    static readonly instance: WorkerPool;
    private _workers;
    private _queue;
    private _executing;
    private _findIdleWorker;
    private _enqueue;
    private _tryDequeue;
    private _onMessage;
    quantize(pixels: Pixels, opts: ComputedOptions): Promise<Swatch[]>;
}
