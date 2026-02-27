type Key = string | symbol;
declare const INIT_SERVICE_FN: unique symbol;
declare const INIT_CALL_FN: unique symbol;
declare const createActivator: (namespace?: string) => {
    InstanceAccessor: {
        new (name: Key): {
            readonly name: Key;
            [INIT_SERVICE_FN]: () => void;
            [INIT_CALL_FN]: () => void;
        };
    };
    provide: <T = object>(name: Key, ctor: T | (() => T)) => void;
    inject: <T = object>(name: Key) => T;
    init: () => void;
    override: <T = object>(name: Key, target: T) => void;
    beforeInit: (fn: (name: string, override: <T = object>(key: Key, instance: T) => void) => void) => (() => void);
};
declare const InstanceAccessor: {
    new (name: Key): {
        readonly name: Key;
        [INIT_SERVICE_FN]: () => void;
        [INIT_CALL_FN]: () => void;
    };
};
declare const provide: <T = object>(name: Key, ctor: T | (() => T)) => void;
declare const inject: <T = object>(name: Key) => T;
declare const init: () => void;
declare const override: <T = object>(name: Key, target: T) => void;
declare const beforeInit: (fn: (name: string, override: <T = object>(key: Key, instance: T) => void) => void) => (() => void);

export { InstanceAccessor, beforeInit, createActivator, init, inject, override, provide };
