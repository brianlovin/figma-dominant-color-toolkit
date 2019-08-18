"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var color_1 = require("../../color");
var omit = require("lodash/omit");
var find = require("lodash/find");
var util_1 = require("../../util");
var WorkerClass = require('worker-loader?inline=true!./worker');
var MAX_WORKER_COUNT = 5;
var WorkerPool = /** @class */ (function () {
    function WorkerPool() {
        this._workers = [];
        this._queue = [];
        this._executing = {};
    }
    Object.defineProperty(WorkerPool, "instance", {
        get: function () {
            if (!this._instance)
                this._instance = new WorkerPool();
            return this._instance;
        },
        enumerable: true,
        configurable: true
    });
    WorkerPool.prototype._findIdleWorker = function () {
        var worker;
        // if no idle worker && worker count < max count, make new one
        if (this._workers.length === 0 || this._workers.length < MAX_WORKER_COUNT) {
            worker = new WorkerClass();
            worker.id = this._workers.length;
            worker.idle = true;
            this._workers.push(worker);
            worker.onmessage = this._onMessage.bind(this, worker.id);
        }
        else {
            worker = find(this._workers, 'idle');
        }
        return worker;
    };
    WorkerPool.prototype._enqueue = function (pixels, opts) {
        var d = util_1.defer();
        // make task item
        var task = {
            id: WorkerPool._task_id++,
            payload: {
                pixels: pixels, opts: opts
            },
            deferred: d
        };
        this._queue.push(task);
        // Try dequeue
        this._tryDequeue();
        return d.promise;
    };
    WorkerPool.prototype._tryDequeue = function () {
        // Called when a work has finished or from _enqueue
        // No pending task
        if (this._queue.length <= 0)
            return;
        // Find idle worker
        var worker = this._findIdleWorker();
        // No idle worker
        if (!worker)
            return;
        // Dequeue task
        var task = this._queue.shift();
        this._executing[task.id] = task;
        // Send payload
        var request = omit(task, 'deferred');
        request.payload.opts = omit(request.payload.opts, 'ImageClass', 'combinedFilter', 'filters', 'generator', 'quantizer');
        worker.postMessage(request);
        worker.idle = false;
    };
    WorkerPool.prototype._onMessage = function (workerId, event) {
        var data = event.data;
        if (!data)
            return;
        // Worker should send result along with payload id
        var id = data.id;
        // Task is looked up by id
        var task = this._executing[id];
        this._executing[id] = undefined;
        // Resolve or reject deferred promise
        switch (data.type) {
            case 'return':
                task.deferred.resolve(data.payload.map(function (_a) {
                    var rgb = _a.rgb, population = _a.population;
                    return new color_1.Swatch(rgb, population);
                }));
                break;
            case 'error':
                task.deferred.reject(new Error(data.payload));
                break;
        }
        // Update worker status
        this._workers[workerId].idle = true;
        // Try dequeue next task
        this._tryDequeue();
    };
    WorkerPool.prototype.quantize = function (pixels, opts) {
        return this._enqueue(pixels, opts);
    };
    WorkerPool._task_id = 0;
    return WorkerPool;
}());
exports.default = WorkerPool;
//# sourceMappingURL=pool.js.map