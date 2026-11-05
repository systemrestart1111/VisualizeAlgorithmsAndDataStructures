#include <stdio.h>
#include <string.h>

/* 以 64 位元遮罩表示 NFA 狀態集合（狀態數 ≤ 64） */
typedef unsigned long long Set;
static int tf[256], tt[256], tc[256], nt, ns;
static void add(int a, int b, int c) { tf[nt] = a; tt[nt] = b; tc[nt] = c; nt++; }
static int isal(char c) { return (c >= 'a' && c <= 'z') || (c >= '0' && c <= '9'); }
static int prec(char c) { return c == '|' ? 1 : c == '.' ? 2 : 3; }

/* 與 thompson-nfa 相同：先轉後序式，再以堆疊組合片段 */
static void thompson(const char *re, int *start, int *accept) {
    char tok[128], out[128], ops[128];
    int k = 0, no = 0, nops = 0, n = (int)strlen(re), ss[64], sa[64], sp = 0;
    for (int i = 0; i < n; i++) { tok[k++] = re[i]; if (i + 1 < n && !strchr("|)*+?", re[i + 1]) && re[i] != '(' && re[i] != '|') tok[k++] = '.'; }
    for (int i = 0; i < k; i++) {
        char t = tok[i];
        if (isal(t)) out[no++] = t;
        else if (t == '(') ops[nops++] = t;
        else if (t == ')') { while (ops[nops - 1] != '(') out[no++] = ops[--nops]; nops--; }
        else { while (nops && ops[nops - 1] != '(' && prec(ops[nops - 1]) >= prec(t)) out[no++] = ops[--nops]; ops[nops++] = t; }
    }
    while (nops) out[no++] = ops[--nops];
    nt = ns = 0;
    for (int i = 0; i < no; i++) {
        char t = out[i];
        if (isal(t)) { add(ns, ns + 1, t); ss[sp] = ns; sa[sp] = ns + 1; sp++; ns += 2; }
        else if (t == '.') { sp--; int bs = ss[sp], ba = sa[sp]; sp--; add(sa[sp], bs, 0); sa[sp] = ba; sp++; }
        else if (t == '|') { sp--; int bs = ss[sp], ba = sa[sp]; sp--; int as = ss[sp], aa = sa[sp]; add(ns, as, 0); add(ns, bs, 0); add(aa, ns + 1, 0); add(ba, ns + 1, 0); ss[sp] = ns; sa[sp] = ns + 1; sp++; ns += 2; }
        else { sp--; int as = ss[sp], aa = sa[sp]; add(ns, as, 0); add(aa, ns + 1, 0); if (t != '+') add(ns, ns + 1, 0); if (t != '?') add(aa, as, 0); ss[sp] = ns; sa[sp] = ns + 1; sp++; ns += 2; }
    }
    *start = ss[0]; *accept = sa[0];
}
static Set closure(Set s) {
    for (int changed = 1; changed;) { changed = 0; for (int k = 0; k < nt; k++) if (!tc[k] && (s >> tf[k] & 1) && !(s >> tt[k] & 1)) { s |= 1ULL << tt[k]; changed = 1; } }
    return s;
}
static Set move(Set s, char c) { Set r = 0; for (int k = 0; k < nt; k++) if (tc[k] == c && (s >> tf[k] & 1)) r |= 1ULL << tt[k]; return r; }

int main(void) {
    const char *res[3] = {"(a|b)*abb", "a(b|c)*", "(ab)+c?"};
    for (int r = 0; r < 3; r++) {
        int start, accept;
        thompson(res[r], &start, &accept);
        char alpha[8];
        int na = 0;
        for (char c = '0'; c <= 'z'; c++) for (int k = 0; k < nt; k++) if (tc[k] == c) { alpha[na++] = c; break; }
        /* DFA 狀態 = NFA 狀態集合；BFS 取 move 後的 ε-closure */
        Set states[64];
        int table[64][8], nd = 1, nacc = 0;
        states[0] = closure(1ULL << start);
        memset(table, -1, sizeof table);
        for (int i = 0; i < nd; i++)
            for (int a = 0; a < na; a++) {
                Set mv = move(states[i], alpha[a]);
                if (!mv) continue;
                Set t = closure(mv);
                int j = 0;
                while (j < nd && states[j] != t) j++;
                if (j == nd) states[nd++] = t;
                table[i][a] = j;
            }
        for (int i = 0; i < nd; i++) nacc += (int)(states[i] >> accept & 1);
        /* 以所有長度 ≤ 5 的字串比對 NFA 與 DFA */
        int total = 0, agree = 0;
        for (int L = 0; L <= 5; L++) {
            int cnt = 1;
            for (int i = 0; i < L; i++) cnt *= na;
            for (int code = 0; code < cnt; code++) {
                Set cur = closure(1ULL << start);
                int s = 0, x = code, dead = 0;
                for (int i = 0; i < L; i++) {
                    int a = x % na; x /= na;
                    cur = closure(move(cur, alpha[a]));
                    if (!dead) { s = table[s][a]; if (s < 0) dead = 1; }
                }
                int nfaOk = (int)(cur >> accept & 1), dfaOk = !dead && (int)(states[s] >> accept & 1);
                agree += nfaOk == dfaOk;
                total++;
            }
        }
        printf("%s: DFA states %d, accepting %d, agree on %d/%d strings\n", res[r], nd, nacc, agree, total);
    }
    return 0;
}
