# Typescript type transformations

![TypeScript type transformations](./assets/logo.png)

My notes and takeaways from the TypeScript type transformations workshop by Matt Pocock. See the [workshop](https://www.totaltypescript.com/workshops/type-transformations) for more details.

## Table of contents

- [extract members of discrimination unions](#extract-members-of-discrimination-unions)
- [excluding members of discrimination unions](#excluding-members-of-discrimination-unions)
- [union types in js](#union-types-in-js)
- [indexed access with arrays](#indexed-access-with-arrays)
- [combining unions in template literal types](#combining-unions-in-template-literal-types)
- [constraint generic except null or undefined](#constraint-generic-except-null-or-undefined)
- [infer with generic arguments](#infer-with-generic-arguments)

## extract members of discrimination unions

- Task
  Extract the the member of discrimination union, so the test cases pass.

  ```tsx
  import type { Equal, Expect } from "@total-typescript/helpers";

  export type Event =
    | {
        type: "click";
        event: MouseEvent;
      }
    | {
        type: "focus";
        event: FocusEvent;
      }
    | {
        type: "keydown";
        event: KeyboardEvent;
      };

  type ClickEvent = unknown;

  type tests = Expect<Equal<ClickEvent, { type: "click"; event: MouseEvent }>>;
  ```

- Solution

  ```tsx
  type ClickEvent = Extract<Event, { type: "click" }>;
  ```

## excluding members of discrimination unions

- Task
  Exclude member of discrimination union so the test cases pass.

  ```tsx
  import type { Equal, Expect } from "@total-typescript/helpers";

  export type Event =
    | {
        type: "click";
        event: MouseEvent;
      }
    | {
        type: "focus";
        event: FocusEvent;
      }
    | {
        type: "keydown";
        event: KeyboardEvent;
      };

  type NonKeyDownEvents = unknown;
  ```

- Solution

  ```tsx
  import type { Equal, Expect } from "@total-typescript/helpers";

  export type Event =
    | {
        type: "click";
        event: MouseEvent;
      }
    | {
        type: "focus";
        event: FocusEvent;
      }
    | {
        type: "keydown";
        event: KeyboardEvent;
      };

  type NonKeyDownEvents = Exclude<Event, { type: "keydown" }>;

  type test = Expect<
    Equal<
      NonKeyDownEvents,
      | {
          type: "click";
          event: MouseEvent;
        }
      | {
          type: "focus";
          event: FocusEvent;
        }
    >
  >;
  ```

## union types in js

From the perspective of TypeScript, we don't know which value the union is, we can just pretend that it's both. And if it is both, it means that everything that you do with the value needs to be evaluated for all possible code paths that you are defining. That’s like multiverses you define, and you handle the cases for its branches. These branches can have more branches until you end up with a very complex set of different possibilities.

## indexed access with arrays

We can index access the values of an array, where put the numbers as keys.

- Example

  ```tsx
  const array = ["apple", "banana"] as const;

  type AppleOrBanana = (typeof array)[0 | 1]; // apple | banana
  // or
  type AppleOrBanana = (typeof array)[number]; // apple | banana
  ```

## combining unions in template literal types

If we combine strings in template literal types, we can get union of all combinations of these strings.

- Example

  ```tsx
  type BreadType = "rye" | "brown" | "white";
  type Filling = "cheese" | "ham" | "salami";

  type Sandwich = `${BreadType} with ${Filling}`;
  // "rye with cheese" | "rye with ham" | "rye with salami" |
  // "brown with cheese" | "brown with ham" | "brown with salami" |
  // "white with cheese" | "white with ham" | "white with salami"
  ```

## constraint generic except null or undefined

In typescript, `{}` represents all values except null or undefined. In fact, the `unknown` is union of `{}, null, undefined`. In typescript, everything is subtype of `{}` except null or undefined. See the image below.

![Types tree](./assets/types-tree.png)

```tsx
// so to constraint generic to all values except null or undefined, we do:
type Generic<T extends {}> = T;
```

## infer with generic arguments

- Task

  Write a type for the `GetPoint` type so that the test cases pass. This type should get the type of the `getPoint` method of the generic passed in.

  ```tsx
  import type { Equal, Expect } from "@total-typescript/helpers";

  interface MyComplexInterface<Event, Context, Name, Point> {
    getEvent: () => Event;
    getContext: () => Context;
    getName: () => Name;
    getPoint: () => Point;
  }

  type Example = MyComplexInterface<
    "click",
    "window",
    "my-event",
    { x: 12; y: 14 }
  >;

  type GetPoint = unknown;

  type test = Expect<Equal<GetPoint<Example>, { x: 12; y: 14 }>>;
  ```

- Solution

  ```tsx
  import type { Equal, Expect } from "@total-typescript/helpers";

  interface MyComplexInterface<Event, Context, Name, Point> {
    getEvent: () => Event;
    getContext: () => Context;
    getName: () => Name;
    getPoint: () => Point;
  }

  type Example = MyComplexInterface<
    "click",
    "window",
    "my-event",
    { x: 12; y: 14 }
  >;

  // here, we could just do the following:
  // type GetPoint<T> = T extends { getPoint: () => infer R } ? R : never;
  // but another pretty cool solution would be:
  type GetPoint<T> = T extends MyComplexInterface<any, any, any, infer TPoint>
    ? TPoint
    : never;
  // this is better, because it doesn't interact with details of the interface.

  type test = Expect<Equal<GetPoint<Example>, { x: 12; y: 14 }>>;
  ```
