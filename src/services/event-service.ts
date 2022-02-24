import Vue from 'vue';

export interface IEventService {
    on(event: string | string[], callback: (...args: unknown[]) => void): this;
    once(event: string | string[], callback: (...args: unknown[]) => void): this;
    off(event: string | string[], callback: (...args: unknown[]) => void): this;
    emit(event: string | string[], ...args: unknown[]): this;
}
export class EventService implements IEventService {
    private eventBus = new Vue();

    public on(event: string  | string[], callback: (...args: unknown[]) => void): this {
        this.eventBus.$on(event, callback);
        return this;
    }
    public once(event: string | string[], callback: (...args: unknown[]) => void): this {
        this.eventBus.$once(event, callback);
        return this;
    }
    public off(event: string | string[], callback: (...args: unknown[]) => void): this {
        this.eventBus.$off(event, callback);
        return this;
    }
    public emit(event: string, ...args: unknown[]): this {
        this.eventBus.$emit(event, ...args);
        return this;
    }
}

