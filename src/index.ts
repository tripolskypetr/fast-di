type Key = string | symbol;

const BEFORE_INIT_LIFECYCLE: ((
    name: string,
    override: <T = object>(key: Key, instance: T) => void
) => void)[] = [];

const INIT_SERVICE_FN = Symbol('init-service-fn');
const INIT_CALL_FN = Symbol('init-call-fn');

export const createActivator = (namespace = "unknown") => {

    const accessorMap = new Map<Key, InstanceAccessor>();
    const factoryMap = new Map<Key, () => unknown>();
    const instanceMap = new Map<Key, unknown>();

    const singleshot = (run: () => void) => {
        let isInitComplete = false;
        return () => {
            if (isInitComplete) {
                return;
            }
            isInitComplete = true;
            run();
        };
    };

    const getInstance = (name: Key): unknown => {
        if (instanceMap.has(name)) {
            return instanceMap.get(name);
        }
        if (factoryMap.has(name)) {
            const instance = factoryMap.get(name)!();
            instanceMap.set(name, instance);
            return instance;
        }
        console.warn(`di-kit namespace=${namespace} name=${String(name)} not provided`);
        return {};
    };

    const createService = (name: Key, self: object) =>
        singleshot(() => {
            Object.setPrototypeOf(self, <object>getInstance(name));
        });

    const createInitializer = (self: any) =>
        singleshot(() => {
            self.init && self.init();
        });

    class InstanceAccessor {
        public readonly name: Key;
        [INIT_SERVICE_FN]: () => void;
        [INIT_CALL_FN]: () => void;

        constructor(name: Key) {
            this.name = name;
            this[INIT_SERVICE_FN] = createService(name, this);
            this[INIT_CALL_FN] = createInitializer(this);
        }
    }

    const provide = <T = object>(name: Key, ctor: T | (() => T)): void => {
        if (typeof ctor === "function") {
            factoryMap.set(name, ctor as () => unknown);
            return;
        }
        instanceMap.set(name, ctor);
    };

    const inject = <T = object>(name: Key): T =>
        (accessorMap.has(name)
            ? accessorMap.get(name)
            : accessorMap.set(name, new InstanceAccessor(name)).get(name)) as T;

    const override = <T = object>(name: Key, target: T): void => {
        {
            const instance = accessorMap.get(name);
            instance && Object.setPrototypeOf(instance, <object>target);
        }
        factoryMap.set(name, () => target);
        instanceMap.set(name, target);
    };

    const init = (): void => {
        for (const fn of BEFORE_INIT_LIFECYCLE) {
            fn(namespace, override);
        }
        for (const accessor of accessorMap.values()) {
            accessor[INIT_SERVICE_FN]();
        }
        for (const accessor of accessorMap.values()) {
            accessor[INIT_CALL_FN]();
        }
    };

    const beforeInit = (
        fn: (name: string, override: <T = object>(key: Key, instance: T) => void) => void
    ): (() => void) => {
        BEFORE_INIT_LIFECYCLE.push(fn);
        return () => {
            const index = BEFORE_INIT_LIFECYCLE.indexOf(fn);
            if (index !== -1) {
                BEFORE_INIT_LIFECYCLE.splice(index, 1);
            }
        };
    };

    return {
        InstanceAccessor,
        provide,
        inject,
        init,
        override,
        beforeInit,
    };
};

export const { InstanceAccessor, provide, inject, init, override, beforeInit } = createActivator('root');
