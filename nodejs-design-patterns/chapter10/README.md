# Universal JavaScript for Web Applications

- [Dependency resolution](#dependency-resolution)
- [Packing](#packing)
- [Runtime code branching](#runtime-code-branching)
- [Build time code branching](#build-time-code-branching)
- [Module swapping](#module-swapping)
- [Design patterns for cross-platform development](#design-patterns-for-cross-platform-development)
- [Universal JS application with React](#universal-js-application-with-react)

These days JS can be used in many applications, starting from the web, servers and ending with drones. These days it’s being very important to share the code between browser and server, making JS universal. You might think that sharing JS engine between browser and server is enough, but it’s not, because different browser users may use older versions of browser with older engines, while it’s ok for server, because we exactly know which Node is running on the server.

While in Node.js files are server from the filesystem, and it’s encouraged to split the code into multiple files for better organization, in browser things work differently. In browser we don’t have `require` keyword to load files, and not all browsers support `import` keyword. Process starts with `index.html` file, where references to js files are given, and browser downloads them. If we have large number of such files, there is perf penalty. This is where bundels come in. It includes collate all source files into minimum number, and reduce number of files to download (1 per page for example). Also supports code minification and other optimizations.

![Shared modules](./assets/shared-modules.png)

Browser code should go 2 steps before being processes: build and runtime, while for server runtime is only one.

So, bundler takes a file as an entry file and its dependencies, and produces on or more bundle files, that are optimized to run in the browser, we can think of bundler as a compiler for browser. It also allow us to downgrade JS syntax with tools like Babel, and optimize assets such as js, images, or css files. Bundler job can be divided into 2 steps: dependency resolution and packing.

## Dependency resolution

When entry point file is given to the bundler, it starts to scan it, and build dependency graph. When it sees import, it recursively goes inside and wires up the dependencies. In below images, numbers are steps. The same happens with cyclic dependencies.

![Dependency resolution](./assets/deps-resolution.png)

Bundler may also perform tree shaking, where unused modules don’t appear in dependency graph, and will not be included in the final bundle. More advanced bundlers may also track exported and imported entities, to exclude single entities that are not imported.

Bundler builds a data structure called “modules map” during dependency resolution. It includes unique module identifiers (file path for example) as keys, and representation of source code as values.

```jsx
{
	'app.js': (module, require) => {/* ... */},
	'calculator.js': (module, require) => {/* ... */},
	'display.js': (module, require) => {/* ... */},
	'parser.js': (module, require) => {/* ... */},
	'resolver.js': (module, require) => {/* ... */}
}

// where calculator.js
import { parser } from "parser.js"
import { resolver } from "resolver.js"
export function calculator(expr){
	return resolver(parser(expr))
}

// is turned into
(module, require) => {
  const { parser } = require('parser.js')
  const { resolver } = require('resolver.js')
  module.exports.calculator = function (expr) {
    return resolver(parser(expr))
  }
}
```

Note that ESM syntax is converted to something reminding CJS, in real world scenario, every bundler uses its own unique identifiers (for example webpack uses `_webpack_require_` and `_webpack_exports_`)

## Packing

We already have a modules map, and now what we need to do is convert it to the executable browser can run. This can be done with wrapper function for modules map:

```jsx
((modulesMap) => {
  const require = (name) => {
    const module = { exports: {} };
    modulesMap[name](module, require);
    return module.exports;
  };
  require("app.js");
})({
  "app.js": (module, require) => {},
  "calculator.js": (module, require) => {},
  "display.js": (module, require) => {},
  "parser.js": (module, require) => {},
  "resolver.js": (module, require) => {},
});
```

We declare custom require function, which accepts name of module in the modulesMap, and executes it with newly declared module variable. If the executing module also requires other modules, they will be recursively loaded. After that module exports is returned. Finally we require the entry point for the application so our application is loaded recursively.

## Runtime code branching

Let’s think of library that works in the browser and the server. How we manage this code? Code branching is the way, and one of its technique is runtime code branching. Example:

```jsx
import nunjucks from "nunjucks";
const template = "<h1>Hello <i>{{ name }}</i></h1>";
export function sayHello(name) {
  if (typeof window !== "undefined" && window.document) {
    // client-side code
    return nunjucks.renderString(template, { name });
  }

  // Node.js code
  return `Hello ${name}`;
}
```

This is intuitive, but has negatives: same code is served to both client and server, so unreachable code is included in the bundle. Server code might have api keys or other things that are not meant to be sent to client. Business logic is mixed with branching logic.

Bundlers have no way of guessing these variables, so dynamic imports using variables are not included in the final bundle:

```jsx
moduleList.forEach(function (module) {
  import(module);
});
```

However there are some cases where bundlers can guess and include modules in the bundle, like in the following case (webpack):

```jsx
function getControllerModule(controllerName) {
  return import(`./controller/${controllerName}`);
}
```

## Build time code branching

Build time code branching is about replacing some variable with a value. For example, in our sayHello example, this variable can be `__BROWSER__`.

```jsx
export function sayHello(name) {
  if (__BROWSER__) {
    return nunjucks.renderString(template, { name });
  }

  return `Hello ${name}`;
}
```

We can replace it with `DefinePlugin` from webpack, which replaces it at build time. After that, by using terser plugin for webpack, we can perform `dead code elimimition`, which is simply removing unreachable statements. If `__BROWSER__` becomes true, webpack is smart enough to understand that below of that statement is unreachable, so it simply removes it from final bundle. Here is webpack config for this. Production mode enables optimizations, which triggers minimization with terser plugin, which eliminates dead code.

```jsx
const TerserPlugin = require('terser-webpack-plugin')
module.exports = {
	mode: 'production', // ...
	plugins: [
	    new webpack.DefinePlugin({
	      __BROWSER__: true
		],
	  optimization: {
	    minimize: true,
	    minimizer: [new TerserPlugin()]
	  }
}
```

However it’s still not ideal, because our codebase can become mass of if statements.

## Module swapping

Another way to separate the code we write into platforms is module swapping. It’s about replacing imported modules at build time. Assuming we have a script that imports `src/say-hello.js`, and files `say-hello-server.js` and `say-hello-browser.js`, we can match it with regex and replace with second argument given to `webpack.NormalModuleReplacementPlugin`.

```jsx
plugins: [
  new webpack.NormalModuleReplacementPlugin(
    /src\/say-hello\.js$/,
    path.resolve(__dirname, "src", "say-hello-browser.js")
  ),
];
```

## Design patterns for cross-platform development

These design patterns are those we already know about.

1. Strategy and Template. This might be the most important set of design patterns, because it lets us define strategies for platform-specific parts, and having same code for platform-agnostic parts. Strategies can be determined at build time with runtime, build-time code branching, or module swapping.
2. Adapter. This is useful when swapping entire component. For example when code which works with SQLite works in browser, we might provide an adapter to use browser storages instead.
3. Proxy. When code intended to be run on server is run on browser, we might want to share functionality in browser too. In this case, for example if we want to access filesystem on the server, we might setup remote proxy (with ajax or websockets) as a way of exchanging commands and return values.
4. Service Locator and dependency injection. It can be useful when replacing implementation of module at the moment of injection. Packing process in bundling is also about service locator. Require function is service locator, modulesMap is central registry. When we ask for specific module it locates it and executes, we don’t inject any dependencies, we pull them by name.

## Universal JS application with React

React is introduced, and explained how it works with class components. Then, with webpack as a bundler on the frontend, fastify was introduced for backend APIs. When request is made to a particular page, `StaticRouter` and react’s `renderToString` (the result of which is placed inside html template’s #root element) method are used to server-side render our application. `StaticRouter` accepts context prop, which is then manipulated inside the rendering component itself to get the status of the response (404 for example) and give appropriate http status code. Location prop is also provided to StaticRouter so it takes appropriate component to render. This is how we can server-side our application.

After that some strategies were shown how to retrieve data in our server and render with it. If we have loading spinner logic in our app, server-side rendered app has loading spinner when client receives it. To avoid it `two-pass rendering` technique is introduced, in which for the first render promises with data retrieval are attached router static context, and server waits for them, again makes render with `renderToString` and this time server-side rendered app has all the data it needs in static context, which is used to render app with data. Sometimes inner components might also have to pre-load data, so multiple rendering passes might be needed, which is called `multi-pass rendering`. Big disadvantage is that this technique comes with its cost, and the whole process of server-side rendering might be very slow.
