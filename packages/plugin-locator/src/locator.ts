import { obx, computed, makeObservable, action } from '@firefly/auto-editor-core';

export class Locator {
    @obx.ref private _active: boolean = false;

    @obx private _currentElement: HTMLElement;

    constructor() {
        makeObservable(this);
    }

    get active() {
        return this._active;
    }

    set active(value: boolean) {
        this._active = value;
    }

    get currentElement() {
        return this._currentElement;
    }

    set currentElement(value: HTMLElement) {
        this._currentElement = value;
    }
}