#include <ctype.h>
#include <stdio.h>

static int prec(char c) { return c == '^' ? 3 : (c == '*' || c == '/') ? 2 : 1; }

/* 運算元直接輸出；運算子進堆疊前，先彈出優先權較高（或相同且左結合）的運算子 */
void to_postfix(const char *s, char *out) {
    char stack[128];
    int top = 0, k = 0;
    for (; *s; s++) {
        char c = *s;
        if (c == ' ') continue;
        if (isalnum((unsigned char)c)) { out[k++] = c; out[k++] = ' '; }
        else if (c == '(') stack[top++] = c;
        else if (c == ')') {
            while (stack[top - 1] != '(') { out[k++] = stack[--top]; out[k++] = ' '; }
            top--;
        } else {
            while (top && stack[top - 1] != '(' && (prec(stack[top - 1]) > prec(c) || (prec(stack[top - 1]) == prec(c) && c != '^'))) {
                out[k++] = stack[--top];
                out[k++] = ' ';
            }
            stack[top++] = c;
        }
    }
    while (top) { out[k++] = stack[--top]; out[k++] = ' '; }
    out[k ? k - 1 : 0] = '\0';
}

int main(void) {
    char out[256];
    to_postfix("A + B * (C - D) / E ^ F ^ G", out);
    printf("%s\n", out);
    return 0;
}
