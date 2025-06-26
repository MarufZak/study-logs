# Universal JavaScript for Web Applications

These days JS can be used in many applications, starting from the web, servers and ending with drones. These days it’s being very important to share the code between browser and server, making JS universal. You might think that sharing JS engine between browser and server is enough, but it’s not, because different browser users may use older versions of browser with older engines, while it’s ok for server, because we exactly know which Node is running on the server.

While in Node.js files are server from the filesystem, and it’s encouraged to split the code into multiple files for better organization, in browser things work differently. In browser we don’t have `require` keyword to load files, and not all browsers support `import` keyword. Process starts with `index.html` file, where references to js files are given, and browser downloads them. If we have large number of such files, there is perf penalty. This is where bundels come in. It includes collate all source files into minimum number, and reduce number of files to download (1 per page for example). Also supports code minification and other optimizations.

![Shared modules](./assets/shared-modules.png)

Browser code should go 2 steps before being processes: build and runtime, while for server runtime is only one.

So, bundler takes a file as an entry file and its dependencies, and produces on or more bundle files, that are optimized to run in the browser, we can think of bundler as a compiler for browser. It also allow us to downgrade JS syntax with tools like Babel, and optimize assets such as js, images, or css files. Bundler job can be divided into 2 steps: dependency resolution and packing.
