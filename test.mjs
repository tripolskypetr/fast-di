import { inject, provide, init } from './build/index.mjs';

const TYPES = {
    serviceFoo: Symbol('serviceFoo'),
    serviceBar: Symbol('serviceBar'),
    serviceBaz: Symbol('serviceBaz'),
};

provide(
    TYPES.serviceFoo, 
    () => new class {
        bar = inject(TYPES.serviceBar);
    }
);

provide(
    TYPES.serviceBar,
    () => new class {
        foo = inject(TYPES.serviceFoo);
        baz = inject(TYPES.serviceBaz);
    }
);

provide(
    TYPES.serviceBaz,
    () => new class { }
);

const ioc = {
    serviceFoo: inject(TYPES.serviceFoo),
    serviceBar: inject(TYPES.serviceBar),
    serviceBaz: inject(TYPES.serviceBaz),
};

init();

console.log(ioc.serviceFoo.bar.foo.bar.foo.bar.baz.name);
console.log(ioc.serviceFoo.bar.name);
console.log(ioc.serviceBar.foo.name);
console.log(ioc.serviceBar.baz.name);
