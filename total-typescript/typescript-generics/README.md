# Typescript generics

![TypeScript generics](./assets/typescript-generics.png)

My notes and takeaways from the TypeScript generics workshop by Matt Pocock. See the [workshop](https://www.totaltypescript.com/workshops/typescript-generics) for more details.

## Table of Contents

- [Multiple generics inferring](#multiple-generics-inferring)
- [Interesting case with return promise type](#interesting-case-with-return-promise-type)
- [Generic function currying](#generic-function-currying)
- [Missing generics](#missing-generics)

## multiple generics inferring

When function accepts multiple generics, typescript will not deeply infer the types of passed generics (meaning if we passed string literal, typescript will infer it as a string). To prevent this, we need to use `extends` to constraint generic to specific type.

```tsx
const returnWhatIsPassed = <T extends string, U>(arg1: T, arg2: U) => {
  return {
    arg1,
    arg2,
  };
};

const obj = returnWhatIsPassed("hello", 123); // { arg1: "hello", arg2: number }
```

The same thing happens for example when we have one generic, but return an object with the generic property inside. There are also some cases when this happens.

Also, more you are away from what exactly you want to infer, the worse inferrence will be. For example if you want to infer a property inside an object, generic should be property itself, not object. This can be seen in following example:

```tsx
const makeStatus = <TStatuses extends string[]>(statuses: TStatuses) => {
  return statuses;
};

const statuses = makeStatus(["INFO", "DEBUG", "ERROR", "WARNING"]);

type tests = [
  Expect<Equal<typeof statuses, Array<"INFO" | "DEBUG" | "ERROR" | "WARNING">>>
]; // error, statuses is string[];

// Solution:
const makeStatus = <TStatus extends string>(status: TStatus) => {
  return statuses;
};
```

## interesting case with return promise type

Suppose we have this code, and we want to make it generic function

```tsx
const fetchData = async (url: string) => {
  const response = await fetch(url);
  const data = await response.json();

  return data;
};
```

One possible solution is to do:

```tsx
const fetchData = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);
  let data = await response.json();

  return data;
};
```

But consider when function returns something else

```tsx
const fetchData = async <T,>(url: string): Promise<T> => {
  const response = await fetch(url);
  let data = await response.json();

  data = null; // !!!

  return data;
};
```

Typescript won't warn us, event if we constraint generic to something else, like string for example, because the type of data is `any`
Better way to do this is to annotate the data variable `const data: T = ...`

## generic function currying

Function generics are always attached to the function call, meaning the arguments are gonna be inferred if the generics are used in the function to which they were attached.

```tsx
export const curryFunction =
  <T, U, V>(t: T) =>
  (u: U) =>
  (v: V) => {
    return {
      t,
      u,
      v,
    };
  };
```

In this case, `U` and `V` properties of return object are `unknown` (default generic value), because generics are not used in the arguments of function where generics were created. We can solve this by manually passing generic arguments when we invoke the function. Or attach generic to its own function where it’s being used.

```tsx
export const curryFunction =
  <T,>(t: T) =>
  <U,>(u: U) =>
  <V,>(v: V) => {
    return {
      t,
      u,
      v,
    };
  };
```

## missing generics

If you're not getting the inference you want, make sure that you haven't got any missing generics. In the case below, we want key to be inferred as a literal, but instead they are being inferred as union of keys.

```tsx
const getValue = <TObj,>(obj: TObj, key: keyof TObj) => {
  return obj[key];
};

const value = getValue({ name: "John", age: 3 }, "name");
// string | number
```

For this, we can create second generic to infer the actual key passed in and with indexed access we can get exact type of value in object.

```tsx
const getValue = <TObj, TKey extends keyof TObj>(obj: TObj, key: TKey) => {
  return obj[key];
};
```

## partial inference

There is a partial inference issue in TS, for example if you have a function, and that function accepts 2 generics, and if you want the first generic to be passed manually and second generic, which depend on first, to be inferred without being passed, typescript cannot do that, and it will be inferred as unknown.

```tsx
export const makeSelectors = <
  TSource,
  TSelectors extends Record<string, (source: TSource) => any> = {}
>(
  selectors: TSelectors
) => {
  return selectors;
};
```

We need to pass both generics to make it correctly typed, or another solution we can do is to refactor.

```tsx
export const makeSelectors =
  <TSource = "makeSelectors expects to be passed a type argument",>() =>
  <TSelectors extends Record<string, (source: TSource) => any>>(
    selectors: TSelectors
  ) => {
    return selectors;
  };

// API changes, because the function now returns another function, which
// accepts selectors and returns it, but now we can skip passing generic
// to the second function.
```
