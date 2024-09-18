# NodeJS design patterns

![NodeJS design patterns book cover](./assets/book-cover.jpg)

My notes and takeaways from the NodeJS Design Patterns book by Mario Casciaro and Luciano Mammino. See the [book](https://www.nodejsdesignpatterns.com/) for more details.

## Table of contents

- [The Node.js platform](#the-nodejs-platform)
  - [I/O (Input / Output)](#io-input--output)
  - [Event demultiplexing](#event-demultiplexing)
  - [The reactor pattern](#the-reactor-pattern)
  - [Libuv](#libuv)
  - [Recipe of Node.js](#recipe-of-nodejs)
  - [Native code](#native-code)
- [Module system](#module-system)
  - [CommonJS](#commonjs)
    - [Homemade module system](#homemade-module-system)
    - [Monkey patching](#monkey-patching)
- [ES Modules](#esmodules)
  - [default export notes](#default-export-notes)
  - [async imports](#async-imports)

## The Node.js platform

The Node.js core (or runtime) is built on top of few principles, one of them is having small core. It keeps all functionalities at a bare minimum leaving all others to the userland.

Another principle in Node.js is designing small modules, which take its roots from Unix philosophy:

1. Small is beautiful.
2. Make each program do one thing well.

Another principle is having small surface area, where a common pattern is to export certain class or function, which is entry point, and not exposing the internals to the outside world.

### I/O (Input / Output)

I/O is slow, accessing the RAM takes nanoseconds, whereas accessing hard disks or network may take milliseconds. There are 2 types of I/O.

1. Blocking. Traditional one used in programming, where function call correspond to some I/O, which blocks the execution of the thread until request is completed. This means a webserver with blocking i/o cannot handle multiple connections in the same thread, it now has to open new threads to process new connections concurrently (note that idle times could be big in each thread, which is wasteful). Unfortunately, threads are expensive, it consumes memory, has context switches (that’s why each thread has idle times) ⇒ having long running thread for each connection is expensive.
2. Non-blocking. Many Operating Systems support it, it returns immediately without waiting for the request to complete. You could make a polling to access the data when it’s available, if it’s not available yet it returns some constant. We can use loop, which checks for the result until it’s available, but this is not efficient, because the loop itself wastes a lot of CPU cycles and time.

### Event demultiplexing

Most Operating Systems provide a native mechanism for handling concurrent non-blocking resources in better way, called **_synchronous event demultiplexer (event notification interface)._**

It watches multiple resources and returns event (or events) when an operations on those resources complete. It goes idle until there are new events to process. When each event is processed by event demultiplexer, the resource associated with each event is guaranteed to be ready to be read. When all events are processed, the flow will block again (thead goes idle) until new events are again available to process. This is called **event loop.**

Now we can handle multiple connections in the same thread, with idle time of the thread reduced. Demultiplexing in this technique refers to using one thread to handle multiple connections. This strategy not only has resources benefits, but also it simplifies concurrency strategies (for example in multi-threads environment we would have to use semaphores).

See difference between blocking i/o and non-blocking i/o (with event demultiplexing) below:

![Blocking I/O threads](./assets/blocking-io-threads.png)
![Non blocking I/O threads](./assets/non-blocking-io-threads.png)

### The reactor pattern

It’s specialization of algorithms that has a handler associated with each I/O operation, and represented by callback function.

1. Application submits a new I/O request to **Event Demultiplexer** and specifies handler with it. This operation is non-blocking ⇒ returns immediately.
2. When the result is available in event demultiplexer, it pushes a set of corresponding event and handler to **Event Queue.**
3. Event loop iterates over event queue, invoking each handler for each event.
4. The handler (which is part of app code) gives control back to the event loop when its execution completes. Or it submits another I/O request that triggers the cycle once more.
5. When all items in Event Queue are processed, event loop goes idle, waiting event demultiplexer to push another items.

![Reactor pattern](./assets/reactor-pattern.png)

Node.js application exits, when there are no more pending operations in event demultiplexer and no more events being processed in event queue.

So, the reactor pattern handles i/o by going idle until new events are available from a set of observed resources, and then reacts by dispatching each event to associated handler.

### Libuv

Each operating system has different API interfaces for the event demultiplexer, and each i/o may behave differently even with one operating system. For example in Unix there is no way to access files in non-blocking manner. To simulate it, we need to create another thread and process it there.

Libuv is low-level i/o engine of node.js, which makes node.js compatible with all major OSs, and normalizes the behavior among them. It implements the reactor pattern, providing APIs for creating event loops, managing event queue and others.

### Recipe of Node.js

Reactor pattern and libuv are building blocks of Node.js, but we need three more components:

1. A set of bindings for wrapping and exposing libuv and other low-level functionalities to JavaScript.
2. V8, JavaScript engine, to compile JavaScript into machine code.
3. A core JavaScript library that implements high-level node.js api, for example `fs` or `http`

![Node.js recipe](./assets/nodejs-recipe.png)

Node.js ships with very recent versions of V8, which means we can use the most new features with confidence.

### Native code

Node.js allows us to reuse components written in C/C++ native code. It can be beneficial because with native code we can access lower-level APIs, for example communicating with hardware drivers. Although V8 is very fast, it is still a bit slower than native code. For CPU-intensive apps, it makes sense to use native code.

## Module system

ES6 specification didn’t come with implementation of modules (ESM), so different browsers companies and node.js had to come up with their own implementation according to the spec.

### CommonJS

CommonJS is the original module system for Node.js that provides a way to organize and structure code by dividing it into reusable modules.

#### Homemade module system

```tsx
import fs from "fs";

function loadModule(filename, module, require) {
  const wrapperSrc = `((module, exports, require)=>{
    ${fs.readFileSync(filename, "utf-8")}
  })(module, module.exports, require)`;

  eval(wrapperSrc);
}

function require(filename) {
  const id = require.resolve(filename);
  if (require.cache[id]) {
    return require.cache[id].exports;
  }

  const module = {
    id,
    exports: {},
  };

  loadModule(filename, module, require);

  return module.exports;
}
require.resolve = (filename) => {
  return filename;
};
require.cache = {};
```

Complete resolving algorithm can be found [here](https://nodejs.org/api/modules.html#modules_all_together).

Synchronous nature of `require` function makes it impossible to export asynchronously. Any assignment to `module.exports` must be synchronous. That’s why most Node.js core modules offer synchronous APIs instead of asynchronous.

CommonJS module system has one disadvantage, it can’t solve the problem with circular dependencies, where different module can have different version of its counterpart depending on when it was required.

```tsx
// module a
module.exports.loaded = false;
const b = require("./b");
module.exports = {
  b,
  loaded: true, // overrides the previous export }
};

// module b
module.exports.loaded = false;
const a = require("./a");
module.exports = {
  a,
  loaded: true,
};

// main.js
const a = require("./a");
const b = require("./b");
console.log("a ->", JSON.stringify(a, null, 2));
console.log("b ->", JSON.stringify(b, null, 2));

/* a = {
  b: {
    a: {
      loaded: false,
    },
    loaded: true,
  },
  loaded: true,
};
b = {
  a: {
    loaded: false,
  },
  loaded: true,
}; */
```

#### Monkey patching

It’s a practice of modifying existing objects (other modules exports) at runtime to change or extend behaviour, or apply temporary fixes. Monkey patching is considered harmful.

```tsx
require("./logger").customFunction = () => {
  console.log("monkey");
};
```

## ESModules

ESM were introduced as ECMAScript 2015 spec, with goal to give JS official module system across different environments. It has support for cyclic dependencies, and load modules async. ES modules are static, and cannot be imported conditionally, only at top of the file.

With ESM we **_must_** include extension of the file in the import path, whereas in CJS we could use either `./myModule.js` or `./myModule`

With ESM absolute path must be like `file:///....` and `/...` or `//...` is not supported.

(browser only) With ESM we can load modules from outside, for example `import mdl from "https://mdl.pkg.com"`.

Namespace import can be imported like:

```tsx
import * as myModule from "./myModule.js";
```

### default export notes

When default exporting, the name of variable or function is ignored, so we can use any name when importing it.

Default export can prevent tree shaking for some cases. For example, when module exports object with properties and methods, even if neither of them were used, most module bundlers think it’s used.

### async imports

Suppose we want to load specific module of language based on which lang pref user has. We can use dynamic imports with `import()` operation. It returns a promise that resolves to the module object.

```tsx
const translationModule = `./strings-${lang}.js`;
import(translationModule).then((strings) => {
  console.log(strings);
});
```
