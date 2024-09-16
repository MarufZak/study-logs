# Typescript generics

![TypeScript generics](./assets/typescript-generics.png)

My notes and takeaways from the TypeScript generics workshop by Matt Pocock. See the [workshop](https://www.totaltypescript.com/workshops/typescript-generics) for more details.

## Table of Contents

- [Multiple generics inferring](#multiple-generics-inferring)

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
