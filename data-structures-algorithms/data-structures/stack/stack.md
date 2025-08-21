Stack is linear data structure, which has one "gate" for insertions and deletions. It's container that follows this rule. It follows LIFO (last in first out) or FILO (first in last out) principles.
For most methods, time complexity is O(1);

Applications:

1. Reverse a string.
2. Undo mechanism.
3. Closing bracket
4. Infix/Postfix/Prefix

---

### Infix / Postfix / Prefix

Why? Infix is the easiest notation for humans to read and evaluate the expression using associativity and higher/lower precedence rules , but it's hard for machines to parse and evaluate it. The best notation for machines is Postfix / Prefix notation. We can convert Infix expression into Postfix expression with stacks.

![desk with explanation of conversion algorithm](/assets/img-1.png)

Example: A-B+(M^N)*(O+P)-Q/R^S*T+Z

| STACK                 | EXPRESSION           |
| --------------------- | -------------------- |
| A                     |
| -                     | AB                   |
| +                     | AB-                  |
| +(                    | AB-                  |
| +(                    | AB-M                 |
| +(^                   | AB-M                 |
| +(^                   | AB-MN                |
| +                     | AB-MN^               |
| +\*                   | AB-MN^               |
| +\*(                  | AB-MN^               |
| +\*(                  | AB-MN^O              |
| +\*(+                 | AB-MN^O              |
| +\*(+                 | AB-MN^OP             |
|                       | AB-MN^OP+            |
| -                     | AB-MN^OP+\*+         |
| -                     | AB-MN^OP+\*+Q        |
| -/                    | AB-MN^OP+\*+Q        |
| -/                    | AB-MN^OP+\*+QR       |
| -/^                   | AB-MN^OP+\*+QR       |
| -/^                   | AB-MN^OP+\*+QRS      |
| -\*                   | AB-MN^OP+\*+QRS^/    |
| -\*                   | AB-MN^OP+\*+QRS^/T   |
| +                     | AB-MN^OP+_+QRS^/T_-  |
| +                     | AB-MN^OP+_+QRS^/T_-Z |
| AB-MN^OP+_+QRS^/T_-Z+ |

### Infix to Prefix

1. First of all, reverse the string, and start operating.
2. If precedence of operator is bigger, push to stack.
3. If input has same precedence as top of the stack, and if associativity is LTR or RTL (doesn’t matter), push into stack.
4. If you find ) parentheses , simply push into stack.
5. If closing parentheses is top of stack, simply push coming operator to stack.
6. If coming operator is opening parentheses , pop & print all operators until you reach closing parentheses.
7. If coming operator has lower precedence that the top of the stack, pop & print top of the stack, then repeat step 6 (check for the next top of the stack).
8. At the end pop & print elements of the stack and reverse the output string. This is answer

Example: K+L-M*N+(O^P)*W/U/V*T+Q
Reversed: Q+T*V/U/W*)P^O(+N*M-L+K

| STACK                  | EXPRESSION             |
| ---------------------- | ---------------------- |
|                        | Q                      |
| +                      | QT                     |
| +\*                    | QT                     |
| +\*                    | QTV                    |
| +\*/                   | QTV                    |
| +\*/                   | QTVU                   |
| +\*//                  | QTVU                   |
| +\*//                  | QTVUW                  |
| +_//_                  | QTVUW                  |
| +_//_)                 | QTVUW                  |
| +_//_)                 | QTVUWP                 |
| +_//_)^                | QTVUWP                 |
| +_//_)^                | QTVUWPO                |
| +_//_                  | QTVUWPO^               |
| ++                     | QTVUWPO^_//_           |
| ++                     | QTVUWPO^*//*N          |
| ++\*                   | QTVUWPO^*//*N          |
| ++\*                   | QTVUWPO^*//*NM         |
| ++-                    | QTVUWPO^*//*NM\*       |
| ++-                    | QTVUWPO^*//*NM\*L      |
| ++-+                   | QTVUWPO^*//*NM\*LK     |
| QTVUWPO^*//*NM\*LK+-++ | reverse                |
| Answer                 | ++-+KL*MN*//\*^OPWUVTQ |

### Prefix expression evaluation

Expression: a+b*c-d/e^f
Reversed: f^e/d-c*b+a
Prefix expression: -+a\*bc/d^ef

1. Evaluate RTL.
2. If it's operand, push into stack.
3. If it's operator, pop 2 values from stack and evaluate (first popped value is first operand). Then push the result to the stack.
4. Do steps 2,3 until you reach the end. Then, if stack contains 1 element, return it.

### Postfix expression evaluation

1. Evaluate LTR.
2. If it's operand, push into stack.
3. If it's operator, pop 2 values from stack and evaluate (**NOTE: SECOND popped value is first operand, and first popped value is second operand**). Then push the result to the stack.
4. Do steps 2,3 until you reach the end. Then, if stack contains 1 element, return it.

Example: 53+62/_35_+

| STACK | EXPRESSION |
| ----- | ---------- |
| 53+   |            |
| 62/   | 8          |
| \_    | 83         |
|       | 24         |
| 35\_  | 24         |
| +     | 24 15      |
|       | 39         |
