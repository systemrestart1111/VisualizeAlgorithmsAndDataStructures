#include <ctype.h>
#include <math.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

/* 調度場演算法：支援函式、逗號參數與一元負號，輸出後序（RPN）再求值 */
typedef struct { int is_num; double num; char op[8]; } Tok;

static double prec(const char *o) {
    if (!strcmp(o, "^")) return 3;
    if (!strcmp(o, "neg")) return 2.5;
    if (!strcmp(o, "*") || !strcmp(o, "/")) return 2;
    if (!strcmp(o, "+") || !strcmp(o, "-")) return 1;
    return -1; /* 函式或括號 */
}
static int is_func(const char *o) { return isalpha((unsigned char)o[0]) && strcmp(o, "neg"); }
static int right_assoc(const char *o) { return !strcmp(o, "^") || !strcmp(o, "neg"); }

static void fmt(double x, char *buf) {
    if (x == floor(x)) sprintf(buf, "%lld", (long long)x);
    else sprintf(buf, "%.4f", x);
}

int to_rpn(const char *s, Tok *out) {
    char ops[64][8];
    int nops = 0, n = 0, prev_value = 0; /* prev_value：前一個 token 是否為數值或右括號 */
    while (*s) {
        if (*s == ' ') { s++; continue; }
        if (isdigit((unsigned char)*s)) {
            char *end;
            out[n].is_num = 1;
            out[n++].num = strtod(s, &end);
            s = end;
            prev_value = 1;
        } else if (isalpha((unsigned char)*s)) {
            int k = 0;
            while (isalpha((unsigned char)*s)) ops[nops][k++] = *s++;
            ops[nops++][k] = '\0';
            prev_value = 0;
        } else {
            char c = *s++;
            if (c == '(') { strcpy(ops[nops++], "("); prev_value = 0; }
            else if (c == ',' || c == ')') {
                while (strcmp(ops[nops - 1], "(")) { out[n].is_num = 0; strcpy(out[n++].op, ops[--nops]); }
                if (c == ')') {
                    nops--;
                    if (nops && is_func(ops[nops - 1])) { out[n].is_num = 0; strcpy(out[n++].op, ops[--nops]); }
                    prev_value = 1;
                } else prev_value = 0;
            } else {
                char t[8] = {c, '\0'};
                if (c == '-' && !prev_value) strcpy(t, "neg"); /* 一元負號 */
                else
                    while (nops && prec(ops[nops - 1]) > 0 &&
                           (prec(ops[nops - 1]) > prec(t) || (prec(ops[nops - 1]) == prec(t) && !right_assoc(t)))) {
                        out[n].is_num = 0;
                        strcpy(out[n++].op, ops[--nops]);
                    }
                strcpy(ops[nops++], t);
                prev_value = 0;
            }
        }
    }
    while (nops) { out[n].is_num = 0; strcpy(out[n++].op, ops[--nops]); }
    return n;
}

double eval_rpn(const Tok *rpn, int n) {
    double st[64];
    int top = 0;
    for (int i = 0; i < n; i++) {
        const char *o = rpn[i].op;
        if (rpn[i].is_num) st[top++] = rpn[i].num;
        else if (!strcmp(o, "neg")) st[top - 1] = -st[top - 1];
        else if (!strcmp(o, "sqrt")) st[top - 1] = sqrt(st[top - 1]);
        else if (!strcmp(o, "abs")) st[top - 1] = fabs(st[top - 1]);
        else {
            double b = st[--top], a = st[--top], r;
            if (!strcmp(o, "max")) r = a > b ? a : b;
            else if (!strcmp(o, "min")) r = a < b ? a : b;
            else if (!strcmp(o, "+")) r = a + b;
            else if (!strcmp(o, "-")) r = a - b;
            else if (!strcmp(o, "*")) r = a * b;
            else if (!strcmp(o, "/")) r = a / b;
            else r = pow(a, b);
            st[top++] = r;
        }
    }
    return st[0];
}

int main(void) {
    Tok rpn[64];
    char buf[32];
    int n = to_rpn("3 + max(4, 2 * 5) * -2 ^ 2 - sqrt(16)", rpn);
    printf("RPN:");
    for (int i = 0; i < n; i++) {
        if (rpn[i].is_num) { fmt(rpn[i].num, buf); printf(" %s", buf); }
        else printf(" %s", rpn[i].op);
    }
    fmt(eval_rpn(rpn, n), buf);
    printf("\nvalue = %s\n", buf);
    return 0;
}
