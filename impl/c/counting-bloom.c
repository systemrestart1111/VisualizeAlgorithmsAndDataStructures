#include <stdio.h>

typedef long long ll;
static ll poly(const char *s, ll base, ll mod) { ll h = 0; for (; *s; s++) h = (h * base + (unsigned char)*s) % mod; return h; }

#define M 16
#define K 3
#define MAXC 15
static int c[M];

static void hashes(const char *s, int *out) {
    ll h1 = poly(s, 31, 1000000007), h2 = poly(s, 37, 998244353) | 1;
    for (int i = 0; i < K; i++) out[i] = (int)((h1 + i * h2) % M);
}
/* 每格是 4 位元計數器（上限 15）：飽和後不再增減，避免溢位造成漏判 */
static void add(const char *s) { int p[K]; hashes(s, p); for (int i = 0; i < K; i++) if (c[p[i]] < MAXC) c[p[i]]++; }
static int query(const char *s) { int p[K]; hashes(s, p); for (int i = 0; i < K; i++) if (!c[p[i]]) return 0; return 1; }
static int rem(const char *s) {
    int p[K];
    if (!query(s)) return 0; /* 確定不存在：拒絕刪除 */
    hashes(s, p);
    for (int i = 0; i < K; i++) if (c[p[i]] < MAXC) c[p[i]]--;
    return 1;
}
static void show(const char *label) { printf("%s", label); for (int i = 0; i < M; i++) printf(" %d", c[i]); printf("\n"); }

int main(void) {
    const char *ws[] = {"apple", "banana", "cherry"}, *qs[] = {"apple", "banana", "cherry", "kiwi"};
    for (int i = 0; i < 3; i++) add(ws[i]);
    show("counters:");
    printf("remove banana: %s\n", rem("banana") ? "True" : "False");
    show("counters:");
    for (int i = 0; i < 4; i++) printf("%s: %s\n", qs[i], query(qs[i]) ? "maybe" : "no");
    printf("remove kiwi: %s\n", rem("kiwi") ? "True" : "False");
    for (int i = 0; i < 20; i++) add("apple");
    show("after 20 more apple:");
    return 0;
}
