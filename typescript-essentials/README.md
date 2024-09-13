# TS Essentials

![TotalTypeScript Pro Essentials logo](./assets/logo.png)

My notes and takeaways from the TotalTypeScript Pro Essentials workshop by Matt Pocock. See the [workshop](https://www.totaltypescript.com/workshops/typescript-pro-essentials) for more details.

## Table of Contents

- [Distributive types](#distributive-types)
- [Readonly](#readonly)
- [as const](#as-const)
- [getters and setters](#getters-and-setters)
- [override](#override)
- [implements](#implements)
- [this](#this)
- [Typescript-only features](#typescript-only-features)
  - [enums](#enums)
  - [namespaces](#namespaces)
- [Deriving types from values](#deriving-types-from-values)
- [satisfies](#satisfies)
- [Weird parts](#weird-parts)
  - [Empty object](#empty-object)
  - [Excess property warning](#excess-property-warning)
  - [Excess properties in functions](#excess-properties-in-functions)
  - [Keys of objects](#keys-of-objects)
  - [Evolving any](#evolving-any)
  - [Functions with object params](#functions-with-object-params)
  - [Unions of function return types](#unions-of-function-return-types)
  - [Errors thrown by a function](#errors-thrown-by-a-function)
- [Modules and scripts](#modules-and-scripts)
  - [Module detection](#module-detection)
- [Declaration files](#declaration-files)
  - [Script](#script)
  - [Module](#module)
- [declare](#declare)
  - [local declare](#local-declare)
  - [global declare](#global-declare)
- [Types you don’t control](#types-you-dont-control)
  - [declaring types for external modules](#declaring-types-for-external-modules)
  - [skipLibCheck](#skiplibcheck)
- [function params](#function-params)
- [type predicates](#type-predicates)
- [assertion functions](#assertion-functions)
- [function overloads](#function-overloads)
- [TSConfig basics](#tsconfig-basics)
  - [Basic options](#basic-options)
  - [Recommended combinations of module and moduleResolution](#recommended-combinations-of-module-and-moduleresolution)
  - [Transpiling with typescript recommendations](#transpiling-with-typescript-recommendations)
  - [Lib and target](#lib-and-target)
  - [Multiple tsconfigs](#multiple-tsconfigs)
  - [extends](#extends)
  - [Project references](#project-references)

## Distributive types

Pick and Omit types are non-distributive, meaning if they are given union as an input, they don’t iterate over member to make operations, but instead it mushes the union into type it can understand, and make operations on it. To make these types distributive, we can construct our own types:

- Example

  ```tsx
  import { Equal, Expect } from "@total-typescript/helpers";

  type User = {
    id: string;
    name: string;
    age: number;
    imageId: string;
  };

  type Organization = {
    id: string;
    name: string;
    address: string;
    imageId: string;
  };

  type Product = {
    id: string;
    name: string;
    price: number;
    imageId: string;
  };

  type Entity = User | Organization | Product;

  type EntityWithoutId = Omit<Entity, "id">;

  // error
  type test = Expect<
    Equal<
      EntityWithoutId,
      | {
          name: string;
          age: number;
          imageId: string;
        }
      | {
          name: string;
          address: string;
          imageId: string;
        }
      | {
          name: string;
          price: number;
          imageId: string;
        }
    >
  >;

  // replacing Omit with following fixes it;
  type DistributiveOmit<T, K extends PropertyKey> = T extends any
    ? Omit<T, K>
    : never;
  ```

## Readonly

Readonly is only assignable to readonly types, whereas not readonly is assignable to readonly types.

- Example

  ```tsx
  const mutableNames = ["Mike", "Peter"];
  const readonlyNames = ["Mike", "Peter"] as const;

  function printReadonlyNames(names: readonly string[]) {}
  function printMutableNames(names: string[]) {}

  printReadonlyNames(mutableNames);
  printReadonlyNames(readonlyNames);

  printMutableNames(mutableNames);
  printMutableNames(readonlyNames); // Error!
  ```

## as const

It just recursively adds readonly property to every item of object, array, or any other data type. We can also put as const to each property of object or array, making specific item its literal value.

- Example

  ```tsx
  const a = {
    btn: "button" as const,
  };

  // regardless, we can change the btn property of object of type A,
  // only to button, not other value.
  ```

## getters and setters

We can skip adding type annotations for setter arguments, because typescript can infer it based on what is returned from the getter.

- Example

  ```tsx
  class Employee {
    private _fullName: string = "";

    get fullName() {
      return this._fullName;
    }

    set fullName(newName) {
      this._fullName = newName;
    }
  }
  ```

## override

`noImplicitOverride` is userful param in tsconfig to make sure we don’t accidentally overriding the methods of the base class. In case we want an override, we can put override keyword before method.

- Example

  ```tsx
  class Employee {
    private _fullName: string = "";

    get fullName() {
      return this._fullName;
    }

    set fullName(newName) {
      this._fullName = newName;
    }

    logFullName() {
      console.log(this._fullName);
    }
  }

  class OfficeEmployee extends Employee {
    // if we don't use override keyword with noImplicitOverride: true,
    // typescript will yell at us.
    override logFullName() {
      console.log("hacked");
    }
  }
  ```

## implements

We can make sure class have **_public api_** as specified in given type with implements keyword.

- Example

  ```tsx
  type Employee = {
    fullName: string;
    logFullName: () => void;
  };

  class OfficeEmployee implements Employee {
    private _fullName = "";

    get fullName() {
      return this._fullName;
    }
    set fullName(newName: string) {
      this._fullName = newName;
    }

    logFullName() {
      console.log(this._fullName);
    }

    logFullName2() {
      console.log(this._fullName);
    }
  }
  ```

## this

In order to type `this` in object methods (let’s say we separated the function from object), we can specify `this` keyword argument.

- Example

  ```tsx
  function add(this: { x: number; y: number }) {
    return this.x + this.y;
  }

  const calculator = {
    x: 0,
    y: 0,
    add,
  };

  calculator.add.call({ x: 12, y: 24 });
  // note that add method doesn't require any argument
  ```

## Typescript-only features

Following features exist in TypeScript only, though they are compiled to JavaScript in certain way.

### enums

enums is a set of named constants. Enums can be 2 types:

1. simple enums. They are reverse-mapped during compilation step to an object. Reverse mapping is like having object with “hello”: 0, and 0: “hello”. It does exist at runtime as obj.

- Example

  ```tsx
  enum Method {
    GET,
    POST,
  }
  ```

1. const enums. Same as simple enums, but at runtime all the code disappears. At compile time the values are replaced with actual values. Not recommended by TS docs, because it might not work well with tools like esbuild, and others. const enums works good with TS compiler.

- Example

  ```tsx
  const enum Method {
    GET,
    POST,
  }

  const methods = [Method.GET, Method.POST];
  // we get:
  const methods = [0, 1];
  ```

### namespaces

Mostly dead feature in TS, was introduced before modules in order to organize the types and values as modules. Can store private items so only members of same namespace can access it, or public. Can be merged by declaring same namespaces **_IN THE SAME SCOPE_**, in this case they both are exported, or both are not exported. Note that interfaces merging can also happen when namespaces are merged. In this case (when namespaces are merged), if there are two interfaces with same name they are gonna be merged also.

- Example

  ```tsx
  namespace MyNamespace {
    export const a = "a";
  }

  namespace MyNamespace {
    export const b = "b";
  }

  console.log(MyNamespace.a);
  console.log(MyNamespace.b);
  ```

## Deriving types from values

We can derive types with keywords such as:

- keyof
- typeof
- class (can be used both as type and value, if used as type, its type is instantiated instance of this class).
- enums (same as class, can be used both as type and value).
- this

```tsx
class Example {
  constructor(public prop: string) {}
  getThis(): this {
    return this;
  }
}
```

- Same name as value and as type.

```tsx
export const React = {};
export type React = typeof React;
```

- function parameters with Parameters generic type.
- function return type with ReturnType generic type.
- return type of async function with Awaited generic type.
- specific values in objects with indexed access `UserType[”id”]`
- union to indexed access type `UserType["id" | "name"]`
- union from tuple of values, with `TupleType[number]` trick.

## satisfies

satisfies is an operator that says that particular value should satisfy certain criteria, while still being inferred what’s passed to it. Can be used in conjunction with `as const`:

- Example

  ```tsx
  const employee = {
    age: 32,
    experience: 12,
  } as const satisfies Record<string, number>;

  // {
  //     readonly age: 32;
  //     readonly experience: 12;
  // }
  ```

## Weird parts

### Empty object

An empty object can represent anything in JavaScript and TypeScript that is not null or undefined. Empty object can be passed to unknown. In fact, `unknown is union of {}, null, or undefined.`

- Example

  ```tsx
  unknown = {} | null | undefined;
  // note that Object type is the same as {}.
  // if you want to have empty object, use Record<string, never>
  ```

  Anything can be assigned to empty object in TypeScript, except null or undefined. So here is types tree:
  ![types tree](./assets/type-tree.png)

### Excess property warning

Let’s say we have function, that accepts an object with certain properties in it.

```tsx
type Params = {
  param1: string;
};

function example(params: Params) {}

// what happens if i pass object with excess properties?
const myParams = {
  param1: "param1",
  param2: "param2",
};

example(myParams); // no error, because typescript thinks our object is assignable
// to the Params, and it doesn't care about excess properties, thinking the func
// doesn't need them. This is good when we instantiate object that is being used
// in other places. BUT typescript will yell at us when we pass that object directly

example({
  param1: "param1",
  param2: "param2", // error!
});

// it's like typescript is saying you are using this only here, why don't you
// remove something that is not needed.
```

Typescript checks for excess properties if you pass directly the object itself, but if you store that in variable first and pass a variable, object excess properties warning is not triggered.

### Excess properties in functions

```tsx
type User = {
  id: string;
  name: string;
};

const usersNames = ["name1", "name2"];

const users: User[] = usersNames.map((name) => {
  return {
    id: Math.random().toString(),
    name,
    // what happens if we pass excess property here?
    age: 30, // there is NO error!
  };
});

// we are not getting error because, again, typescript doesn't mind for excess
// properties by default, to enable warnings, we need to manually anotate the
// return type of the map callback function.
```

### Keys of objects

- First case

  ```tsx
  const obj = {
    one: 1,
    two: 2,
  };

  const keys = Object.keys(obj);
  // the type of keys variable here is string[]. This is maximum safe type
  // that Typescript can provide to us, because it doesn't know whether or not
  // we modify the obj at runtime, to include certain keys. Sometimes typescript
  // doesn't infer the exact type, because it might not be safe one. The same
  // is with Object.entries
  ```

- Second case

  ```tsx
  type User = {
    name: string;
    id: string;
  };
  function print(user: User) {
    for (const key in user) {
      console.log(user[key]); // TypeError! type string cannot be used to type
      // can't be used to index type 'User'
    }
    // the same error we get if we use Object.keys. Why? Because iterating on the
    // object keys of object resolves to string type, not literal type of key.
    // the solution is to widen param type (User->Record<string,string>),
    // or to assert that a key string is of type keyof User;
  }
  ```

### Evolving any

```tsx
let a; // type: any
a = 50; // type: any, BUT in the next line:
a; // type number;

a = "50"; // type: any;
a; // type: string;

// this pattern is called `evolving any`. When we declare a variable without
// providing a value, typescript doesn't turn off type checking just like
// in other cases, but it waits until smth is assigned to it, and when done so,
// it realizes its type. We can assign it to anything down the line, and
// typescript is smart enough to figure out what type is it.

// same works with arrays:
const array = []; // type: any[]

array.push(1); // type: any[]
array; // number[]

array.push("1"); // type: any[];
array; // type: (number | string)[]
```

### Functions with object params

```tsx
const logId = (obj: { id: string }) => {
  console.log(obj.id);
};
const logName = (obj: { name: string }) => {
  console.log(obj.name);
};

const loggers = [logId, logName];

function logAll(obj) {
  loggers.map((logger) => logger(obj));
}

// how should we type the obj type so that we don't have errors?
// loggers has a type of union of logId and logName, and so does logger.
// but if we hover over logger when it's being called, we get type:
// (parameter) logger: (obj: {
//    id: string;
// } & {
//  name: string;
// }) => void

// the params of union of functions are being smashed, and logger function
// expects the type of obj which merge of 2 params of 2 functions. This is the
// type we need.
// If you ask why we can pass excess properties to logger function, it's
// because excess properties checking is turned off by default in typescript for
// variables we pass.

// let's look at another case:

const objOfFunctions = {
  string: (input: string) => input.toUpperCase(),
  number: (input: number) => input.toFixed(2),
  boolean: (input: boolean) => (input ? "true" : "false"),
};

const format = (input: string | number | boolean) => {
  const inputType = typeof input as "string" | "number" | "boolean";
  const formatter = objOfFunctions[inputType];

  return formatter(input); // type 'string | number | boolean' is not assignable
  // to parameter of type 'never'.
};

// again, the type of formatter function is union of 3 function types,
// and when it's like that, it always receives the merged type of params
// of those 3 functions. In this case: string & number & boolean => never.
// Solution is to assert input as never type.
// Note that as any doesn't work, because any is not assignable to type never.
```

### Unions of function return types

While in the union of functions, the params are getting merged, the return types are being converted to union. So the return type of func is union of string and number.

```tsx
const idToUppercase = (obj: { id: string }) => {
  return obj.id.toUpperCase();
};

const idToInt = (obj: { id: string }) => {
  return parseInt(obj.id);
};

const funcs = [idToUppercase, idToInt];

const resolveAll = (obj: { id: string }) => {
  return funcs.map((func) => {
    return func(obj);
  });
};

const result = resolveAll({ id: "1" });

// while in the union of functions, the params are getting merged,
// the return types are being converted to union. So the return type
// of func is union of string and number
```

### Errors thrown by a function

In typescript there is no way of annotating thrown errors by function. Also we cannot annotate error variable inside catch block. Only solution to recognize the errors is to use `instanceof` operator. There is a trick like this:

```tsx
function test():
  | {
      success: false;
      e: SyntaxError | DOMException;
    }
  | {
      success: true;
      data: [];
    } {
  try {
    if (Math.random() > 0.5) {
      throw new Error();
    }
    return {
      success: true,
      data: [],
    };
  } catch (e) {
    if (e instanceof SyntaxError) {
      return {
        success: false,
        e,
      };
    } else if (e instanceof DOMException) {
      return {
        success: false,
        e,
      };
    }
    throw e;
  }
}

// the return type of function is:
type R =
  | {
      success: false;
      e: SyntaxError | DOMException;
    }
  | {
      success: true;
      data: [];
    };
// which might be good for consumer.
```

## Modules and scripts

By default, typescript thinks of every ts file as a script, meaning everything declared inside it can be used in other files with no import. But if we use exports, then a file is treated as module, and we cannot access type from other types without exporting it.

- Example

  ```tsx
  // file1.ts
  type A = { a: number };

  // file2.ts
  type B = A;
  ```

### Module detection

We can change this behavior, by using `moduleDetection` option in tsconfig. It has 3 values:

1. auto - same as legacy, but also it checks whether type in package.json is set to module, when module in tsconfig is `nodenext` or `node16`, and whether current file type jsx when `jsx` option is set to `react-jsx`.
2. force - forces to use modules
3. legacy - checks for imports and exports to determine.

## Declaration files

Declaration files are files that end with `.d.ts` and can only contain types and interfaces, which can be exported. It cannot contain runtime code.

Declaration files are mainly used with js files, they describe what types those js files have. Declaration files must have same name as js file, and for all exports from js file it should provide typings. if we update types in js file, ts will not catch errors, we should manually update in .d.ts file also. We can only import from .js in .ts file if this .js file has corresponding declaration file.

Declaration files can be used in 2 types.

### Script

In this case, ts compiler treats declaration file as a script, and you can choose not to export type from it, but it is still accessible in other modules. Even if you set moduleDetection to force, this option only works for .ts and .tsx files, not .d.ts. I noticed that if `.d.ts` and `.ts` files have same name, we cannot use type in declaration file from source file, we need to include declaration file in `types` option in tsconfig.

### Module

In this case, types that have export keyword cannot be used as global types, you must import them first.
There is weird behavior in declaration file, when you have exported type, and then have not exported type, you can use the second (not exported one) by importing it.

- There is workaround for this.

  ```tsx
  export type A = {};
  type B = {};

  // this tells typescript not to let us import unexported types.
  export {};
  ```

- Example

  ```tsx
  // js file
  export const func = () => "hi";

  // .d.ts file
  export function func(): string;
  ```

## declare

declare keyword in TypeScript is used to specify types for global or local variables. Whenever we use it, ambient context is created, which means that the variable is injected without needing to provide an implementation.

### local declare

If you have module setup, then `declare` specify type as a LOCAL variable, and we cannot access it in other modules.

In this case, the **`declare`** variable is available throughout the file it's declared in, and doesn't pollute the global namespace.

- Example

  ```tsx
  // let's say we have DEBUG variable, that is injected in the global scope.
  const result = DEBUG.getResult();

  // we can specify type for it with declare keyword:
  declare const DEBUG: {
    getResult: () => {
      id: string;
    };
  };
  ```

### global declare

In this case, the **`declare`** keyword allows for the simulation of a global variable within the local scope of a module.
There are two ways to declare global types in TypeScript:

1. Declaring global types and constants in a **`.d.ts`** file.
2. Using `declare global` in .ts file.
   This approach is same as using declare const DEBUG, but this one makes DEBUG variable available in the global scope.

- Example

  ```tsx
  declare global {
    const DEBUG: {
      getState(): { id: string };
    };
  }
  ```

## types you don’t control

- Case 1
  Let’s say we have following tsconfig.ts

  ```tsx
  {
    "compilerOptions": {
      "target": "ES2015"
    }
  }
  ```

  And following code

  ```tsx
  const str = "Hello, world!";
  str.replaceAll("Hello", "Goodbye"); // Error: Property 'replaceAll' doesn't
  // exist on type "Hello, world!"
  ```

  There are a variety of **`lib.d.ts`** files that ship with TypeScript, each corresponding to a specific version of JavaScript. The `target` option specifies which declaration file to use. `replaceAll` method didn’t exist in String prototype until es2021, so it has no types in es2015 declaration files on String interface.
  Just for fun we can specify `noLib` true option, which just turns off all the typings coming from lib declaration files.
  There is another option `lib` which tells exactly which libraries we want inside specified target to be (because there are many libraries included in target), if we don’t choose, it’s all libs in target by default.

- Case 2
  Did you have a problem when you cannot iterate over DOM elements. Well, this is because corresponding lib was not specified in `lib` option in tsconfig, and the lib is `DOM.Iterable`

  ```tsx
  const elements = document.querySelectorAll("div");

  for (const element of elements) {
    element.innerHTML = "Hello World!";
  }

  // error: Type 'NodeListOf<HTMLDivElement>' must have a '[Symbol.iterator]()'
  // method that returns an iterator.
  ```

- Case 3
  Let's say we want to add some object to global window object. If we go to declaration files, we see that global window object is: `declare var window: Window & typeof globalThis`.
  We also know that if two interfaces are declared in the same scope, there are gonna be merged. The idea is to make our window interface, so it's merged with globally declared one.
  If we do this in the .ts file, where we are accessing global object on window (to which we need type to be attached), it's NOT gonna be merged with global Window interface, because there MUST be in the same scope. In our case, our interface is LOCAL, NOT GLOBAL.
  To make it global, we can either create Window interface in .d.ts file, or use `declare global {}` in .ts file.

### declaring types for external modules

Let’s say we have a lib, which has no types and type declarations. We can write them out ourselves! In order to do so, in the global scope, we need to use syntax: `declare module 'my-module-name' {}`.

- Example

  ```tsx
  declare module "my-module-name" {
    export function myFunc(): string;
    // we are using export here because the lib exports this function.
  }
  ```

But let’s say we are importing non-code files, like images, what can we do about its typings?

When using `declare module` syntax, for the module name we can use wildcard char to list all modules that match to this wildcard.

- Example

  ```tsx
  declare module "*.png" {
    const png: string;
    export default png;
  }

  // index.ts
  import image from "./image.png";
  ```

### **skipLibCheck**

This option in tsconfig tells compiler to skip checking all declaration files, including yours and in `node_modules`.

- Example

  ```tsx
  type TParams = {
    name: string;
  };

  type TSurname = TParams["surname"];
  // no errors!
  ```

Note that the approach of using `exclude: ["node_modules"]` in tsconfig doesn’t prevent compiler from checking `node_modules`

## function params

function params should always be a tuple. When annotating function params with generics, if we annotate the params of the function as array, we lose inference when using this function, meaning it will be inferred as an array, not tuple. To solve the problem we should use the generic as a tuple.

- Example

```tsx
// we should not
const func = <T,>(...args: T[]) => args;
const result = func("apple"); // string[]

// we should
const func = <T extends any[]>(...args: T) => args;
const result = func("apple"); // [string]
```

## type predicates

Sometimes when checking logic is too big, we want to put it to separate function.

Type predicates helps typescript to say something is certain type if the function returns true, or not, if returns false. But note that type predicates can be unsafe, meaning we can say the value is number, and check if typeof value is string.

- Example

  ```tsx
  // "value is number" would be valid also,
  // typescript won't yell at us. Be accurate!
  function check(value: unknown): value is string {
    return typeof value === "string";
  }
  ```

Interesting case: if checking is too much, typescript just won’t infer the return type, and we need to tell typescript manually with type predicates.

- Example

  ```tsx
  function isUser(user: unknown) {
    return (
      typeof user === "object" &&
      user !== null &&
      "name" in user &&
      "email" in user &&
      "age" in user &&
      "city" in user &&
      "country" in user &&
      typeof user.name === "string" &&
      typeof user.email === "string" &&
      typeof user.age === "number" &&
      typeof user.city === "string" &&
      typeof user.country === "string"
    );
  }

  function checkUser(user: unknown) {
    if (isUser(user)) {
      user.name; // Error, 'user' is of type 'unknown'
      // First solution is to put all checks in if block.
      // Another solution is to add type predicate to the isUser function
    }
  }
  ```

## assertion functions

Sometimes we throw errors instead of returning booleans, so in this case assertion functions are helpful. It says if function doesn’t throw error, the type of value is certain type. The same problem of being unsafe exists here also.

- Example

  ```tsx
  function isAdmin(value: User | AdminUser): asserts value is AdminUser {
    if (value.role === "user") {
      throw new Error("not admin");
    }
  }
  ```

## function overloads

Function overloads allow you to define multiple ways a function can be called. They look like several extra function keywords above the function, followed by an implementation signature.

- Example

  ```tsx
  function sum(
    valuesOrA: { a: number; b: number } | number,
    b?: number
  ): number {
    if (typeof valuesOrA === "object") {
      return valuesOrA.a + valuesOrA.b;
    }
    return valuesOrA + b!;
  }

  // can be turned into:
  function sum(valuesOrA: { a: number; b: number }): number;
  function sum(valuesOrA: number, b: number): number;
  function sum(
    valuesOrA: { a: number; b: number } | number,
    b?: number
  ): number {
    // 3
    if (typeof valuesOrA === "object") {
      return valuesOrA.a + valuesOrA.b;
    }
    return valuesOrA + b!;
  }
  ```

Note that only overloads are exposed to the consumer, and actual implementation signature is not. Consumers cannot use function with params annotated in implementation signature, unless it’s compatible with one of the overloads.

Implementation signature must be compatible with overloads.

## TSConfig basics

### Basic options

1. `esModuleInterop` - Emit additional JavaScript to ease support for importing CommonJS modules. This enables `allowSyntheticDefaultImports` for type compatibility. Typescript outputs special functions to handle default imports of CJS into ESM.

   - Example with esModuleInterop false

     ```jsx
     // moduleA.ts
     function greet(name: string) {
       return `Hello, ${name}!`;
     }

     export = greet;

     // moduleB.ts
     import greet from "./moduleA.ts";
     // error: Module can only be default-imported using the 'esModuleInterop'
     // flag
     ```

   - Example with esModuleInterop true

     ```jsx
     // moduleA.ts
     function greet(name: string) {
       return `Hello, ${name}!`;
     }

     export = greet;

     // moduleB.ts
     import greet from "./moduleA.ts"; // works fine
     ```

   Note that `export =` is typescript syntax to support interoperability between CommonJS modules and ES6 modules.

   Before these flags, we had to use `import * as myModule from './myModule.ts'` , but it’s not compliant to ES6 module spec. This tsconfig option solves this problem.

2. `allowSyntheticDefaultImports` - Allow default imports from modules with no default export. This does not affect code emit, just typechecking. Implicitly set to true when `esModuleInterop` is true.
3. `allowJs` - lets us import js files into ts files.
4. `resolveJsonModule` lets us import json files **_transpiling with typescript._** Typescript also infers the type of parsed json.
5. `outDir` - where to put the generated code.
6. `sourceMap` - whether to include source maps for the source code. Source map lets you map compiled javscript code to original typescript code, so when hover over and clicking the imported entity, it goes to original ts code, rather than js. Good for debugging.
7. `declaration` - used when building a library to generate declaration files.
8. `declarationMap`- If you are transpiling your ts code into declaration and js files, if you try to navigate to the type or interface you are importing from module, you are navigated to declarationFile. To fix this, declarationMap is used, this maps declaration files to source files. This feature might be useful in monorepo, because the code you are transpiling is yours, and from npm you are probably not going to get typescript source files.
9. `noUncheckedIndexedAccess` - make type of items in array a union of undefined and its type, making sure we check the accessed item if it exists.
10. `isolatedModules` - Ensure that each file can be safely transpiled without relying on other imports ⇒ disables some typescript features that would be unsafe in import/export environment.

    - Example

      ```jsx
      declare const enum Numbers {
        Zero,
        One,
        Two,
      }

      // isolatedModules: false // no error

      const example = Numbers.Zero;

      // declare keyword puts everything inside it in ambient context,
      // meaning it disappears at runtime. Such syntax can only be compiled
      // by typescript, not by swc, babel, or esbuild (they just strip out the
      // types), they do single file transpilation.

      // there is gonna be runtime error if we use bundlers. If we use
      // isolatedModules, we say that we are using single file transpilation,
      // and since then declaring enum like this is not safe anymore,
      // typescript will warn us about this.

      // isolatedModules: true

      const example = Numbers.Zero;
      // error! Cannot access ambient const enums when 'isolatedModules'
      // is enabled

      ```

11. `moduleResolution` - how the imports, how should that be resolved.
12. `module` - specify what module code is generated. It accepts 3 values.

    - `NodeNext` - implies `moduleResolution: NodeNext` under the hood. It’s used when we are using tsc when transpiling our code. It copies the way Node works to compile our project. If we are using .cts as file extension, our code is transpiled as CJS, if using .mts, our code is transpiled as ESM. Also, if folder has package.json, tsc compiler sees that file to detect which to use. It sees `module` option.
    - `ESNext` - force all files to use ESM. When compiler sees cts using esm, it’s gonna break.
    - `CommonJS` - force all files to use CJS. When compiler sees mts using cjs, it’s gonna break.

13. `verbatimModuleSyntax` - the problem it solves is using fake ESM in CJS modules. Note that this works when transpiling with tsc. Also it forces you to import types with `type` keyword.

- Example

  ```tsx
  // example.cts

  export const example = "";
  // this is NOT causing errors, although it should, because we are using
  // esm in cts file. To fix this, we should use verbatimModuleSyntax: true.
  // verbatimModuleSyntax makes it stricter about CJS exports.

  // example2.cts
  import { example } = require("./example.cts");
  // this is typescript feature to make the imports from cts modules type-safe.
  // besides that, this option forces us to use type keyword if we are importing
  // types from a module.

  import type { User } from './mymodule.ts'
  // or
  import { type User } from './mymodule.ts'
  ```

1. `skipLibCheck` - This option in tsconfig tells compiler to skip checking all declaration files, including yours and in `node_modules`.

   - Example

     ```tsx
     type TParams = {
       name: string;
     };

     type TSurname = TParams["surname"];
     // no errors!
     ```

   The approach of using `exclude: ["node_modules"]` in tsconfig doesn’t prevent compiler from checking `node_modules`

2. `jsx` - this option lets tsc to handle jsx syntax. It has 5 values

- `preserve` - typescript doesn’t touch the jsx syntax, and in fact transforms tsx file into jsx (when we are using typescript to transpile our code).
- `react` - ts compiler transforms ts into js with `React.createElement`, but it expects React to be imported in the file.
- `react-jsx` - same as `react` option, but you don’t need to import React. This option is newer and imports newer jsx transform functions.

### Recommended combinations of module and moduleResolution

- If using tsc to compile our code, `module` should be `NodeNext`, and `moduleResolution` should also be `NodeNext`. In this case, when importing from files, it demands us to use .js extension in path, even it doesn’t exist yet. If you want to use like `import example from ‘example’`, it’s permitted by bundlers, but not by tsc compiler, so it forces you to use file extension.

  - Example

    ```jsx
    // assuming "type" option in package.json is "module".

    // example1.ts
    export const str = "str";

    // example2.ts
    import { str } from "./example1";
    // error! Relative import paths need explicit file extensions
    // with moduleResolution 'node16' or 'nodenext'. Did you
    // mean './ts2.js'
    ```

- If using bundlers to compile ts files, we should use `module: ESNext` (because it most closely represents what happens inside the bundler), and `moduleResolution: Bundler`. This allows us to use in path ‘.js’, or not using extension at all to import from files, because external bundlers support it.

  - Example

    ```jsx
    // assuming "type" option in package.json is "module".

    // example1.ts
    export const str = "str";

    // example2.ts
    import { str } from "./example1"; // fine
    ```

### Transpiling with typescript recommendations

`module` should be `Preserve`, and `noEmit` is `true`. This makes typescript as a linter, and we can use it with external bundler. If code runs in DOM, `lib` should be `[”es2022”, “dom”, “dom.iterable"]` . If code doesn’t run in DOM, `lib` should be `[”es2022”]`

### Lib and target

Lib lets you specify which javascript features are available in environment we are working in. Target option specifies version of js our code is gonna be transpiled to. If you want to transform your code and down-level the code with polyfills, typescript will not do that! Typescript will only transform the syntax, without adding pollyfills.

### Multiple tsconfigs

When ts compiler sees .ts file, it uses closest parent tsconfig as config. We can use this feature to make two behaviors for ts files, for example, based on environment (for example `lib` set to `“ES2015.Core”` tells ts compiler that this is for server environment).
Also, when we have multiple tsconfigs, global .d.ts files are attached to the closest tsconfig, meaning if we have 2 dirs with 2 tsconfigs and .d.ts files, .d.ts file in first folder is available only for the first folder, and second one for second.

### extends

tsconfig can extend other tsconfig files with extends keyword. Note that the base file can be any file name, for example `tsconfig.base.config.json` (this name also means that tsconfig won’t use this file as a config), just any. AND `extends` keyword is just for `compilerOptions`, meaning everything outside of compilerOptions it will be excluded.

### project references

If you have a multiple tsconfig files, and you have to run both of them to build, or watch, or anything else, we can make one tsconfig at the root (lets say both of above ones are in their folders), and use `references` option to reference tsconfig files.

We can also use `files: []` option in the root tsconfig to say that this tsconfig is not responsible for any file checks.

After we use references, in the package.json we can make use `tsc -b` option to run typescript compiler in the build mode, meaning it uses references option to run all of our tsconfig files. If we don’t use tsc -b, it’s not going to go to project references.

There is one more option to set to child tsconfig files - `composite` true option. This basically tells ts compiler that this is child config, and is used in parent config as a reference.
