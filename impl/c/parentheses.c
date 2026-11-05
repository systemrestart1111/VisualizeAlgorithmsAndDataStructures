#include <stdbool.h>
#include <stdio.h>
#include <string.h>

/* 遇到左括號就推入堆疊；遇到右括號時，堆疊頂端必須是對應的左括號 */
bool is_balanced(const char *s) {
    char stack[256];
    int top = 0;
    for (; *s; s++) {
        char c = *s;
        if (c == '(' || c == '[' || c == '{') stack[top++] = c;
        else if (c == ')' || c == ']' || c == '}') {
            char want = c == ')' ? '(' : c == ']' ? '[' : '{';
            if (top == 0 || stack[--top] != want) return false;
        }
    }
    return top == 0;
}

int main(void) {
    const char *tests[] = {"{[()()]}([]{})", "{[(])}", "(("};
    for (int i = 0; i < 3; i++) printf("%s -> %s\n", tests[i], is_balanced(tests[i]) ? "True" : "False");
    return 0;
}
