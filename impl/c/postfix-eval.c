#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* 數字推入堆疊；遇到運算子就彈出兩個數計算，結果再推回去 */
long eval_postfix(const char *expr) {
    char buf[256];
    long stack[128];
    int top = 0;
    strcpy(buf, expr);
    for (char *tok = strtok(buf, " "); tok; tok = strtok(NULL, " ")) {
        if (strlen(tok) == 1 && strchr("+-*/", tok[0])) {
            long b = stack[--top], a = stack[--top];
            switch (tok[0]) {
                case '+': stack[top++] = a + b; break;
                case '-': stack[top++] = a - b; break;
                case '*': stack[top++] = a * b; break;
                default: stack[top++] = a / b;
            }
        } else stack[top++] = atol(tok);
    }
    return stack[0];
}

int main(void) {
    printf("%ld\n", eval_postfix("5 1 2 + 4 * + 3 -"));
    return 0;
}
