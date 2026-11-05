#include <stdio.h>
#include <string.h>

/* 轉移 (from, to, c)，c = 0 表示 ε */
static int tf[256], tt[256], tc[256], nt, ns;

static int new_state(void) { return ns++; }
static void add(int a, int b, int c) { tf[nt] = a; tt[nt] = b; tc[nt] = c; nt++; }
static int isal(char c) { return (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9'); }
static int prec(char c) { return c == '|' ? 1 : c == '.' ? 2 : 3; }

/* 插入隱含的連接符號「.」後，用 Shunting-yard 轉成後序式 */
static void to_postfix(const char *re, char *out) {
    char tok[128], ops[128];
    int k = 0, no = 0, nops = 0, n = (int)strlen(re);
    for (int i = 0; i < n; i++) {
        tok[k++] = re[i];
        if (i + 1 < n && !strchr("|)*+?", re[i + 1]) && re[i] != '(' && re[i] != '|') tok[k++] = '.';
    }
    for (int i = 0; i < k; i++) {
        char t = tok[i];
        if (isal(t)) out[no++] = t;
        else if (t == '(') ops[nops++] = t;
        else if (t == ')') { while (ops[nops - 1] != '(') out[no++] = ops[--nops]; nops--; }
        else { while (nops && ops[nops - 1] != '(' && prec(ops[nops - 1]) >= prec(t)) out[no++] = ops[--nops]; ops[nops++] = t; }
    }
    while (nops) out[no++] = ops[--nops];
    out[no] = 0;
}
/* 每個片段有一個起點與一個接受狀態 */
static void thompson(const char *re, int *start, int *accept) {
    char pf[128];
    int ss[64], sa[64], sp = 0;
    to_postfix(re, pf);
    nt = ns = 0;
    for (char *p = pf; *p; p++) {
        char t = *p;
        if (isal(t)) { int s = new_state(), a = new_state(); add(s, a, t); ss[sp] = s; sa[sp] = a; sp++; }
        else if (t == '.') { sp--; int bs = ss[sp], ba = sa[sp]; sp--; add(sa[sp], bs, 0); sa[sp] = ba; sp++; }
        else if (t == '|') {
            sp--; int bs = ss[sp], ba = sa[sp]; sp--; int as = ss[sp], aa = sa[sp];
            int s = new_state(), e = new_state();
            add(s, as, 0); add(s, bs, 0); add(aa, e, 0); add(ba, e, 0);
            ss[sp] = s; sa[sp] = e; sp++;
        } else {
            sp--; int as = ss[sp], aa = sa[sp];
            int s = new_state(), e = new_state();
            add(s, as, 0); add(aa, e, 0);
            if (t != '+') add(s, e, 0);
            if (t != '?') add(aa, as, 0);
            ss[sp] = s; sa[sp] = e; sp++;
        }
    }
    *start = ss[0]; *accept = sa[0];
}
static void closure(int *in) {
    int stack[256], top = 0;
    for (int i = 0; i < ns; i++) if (in[i]) stack[top++] = i;
    while (top) { int u = stack[--top]; for (int k = 0; k < nt; k++) if (tf[k] == u && !tc[k] && !in[tt[k]]) { in[tt[k]] = 1; stack[top++] = tt[k]; } }
}
static int accepts(int start, int accept, const char *w) {
    int cur[128] = {0}, nx[128];
    cur[start] = 1;
    closure(cur);
    for (const char *p = w; *p; p++) {
        memset(nx, 0, sizeof nx);
        for (int k = 0; k < nt; k++) if (cur[tf[k]] && tc[k] == *p) nx[tt[k]] = 1;
        closure(nx);
        memcpy(cur, nx, sizeof cur);
    }
    return cur[accept];
}

int main(void) {
    const char *res[3] = {"(a|b)*abb", "a(b|c)*", "(ab)+c?"};
    const char *tests[3][6] = {{"abb", "aabb", "babb", "ab", "", "abab"}, {"a", "abcb", "b", "ac"}, {"ab", "ababc", "c", "abcc"}};
    int nts[3] = {6, 4, 4};
    for (int r = 0; r < 3; r++) {
        int s, a;
        thompson(res[r], &s, &a);
        printf("%s: %d states, %d transitions;", res[r], ns, nt);
        for (int t = 0; t < nts[r]; t++) printf(" %s=%c", tests[r][t][0] ? tests[r][t] : "ε", accepts(s, a, tests[r][t]) ? 'Y' : 'N');
        printf("\n");
    }
    return 0;
}
