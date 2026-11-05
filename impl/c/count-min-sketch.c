#include <stdio.h>

typedef long long ll;
static ll poly(const char *s, ll base, ll mod) { ll h = 0; for (; *s; s++) h = (h * base + (unsigned char)*s) % mod; return h; }

#define D 3
#define W 8
static int t[D][W];

static void cols(const char *s, int *out) {
    ll h1 = poly(s, 31, 1000000007), h2 = poly(s, 37, 998244353) | 1;
    for (int i = 0; i < D; i++) out[i] = (int)((h1 + i * h2) % W);
}
static void update(const char *s, int c) { int j[D]; cols(s, j); for (int i = 0; i < D; i++) t[i][j[i]] += c; }
/* 查詢取 d 個計數的最小值（只會高估，不會低估） */
static int query(const char *s) { int j[D], m; cols(s, j); m = t[0][j[0]]; for (int i = 1; i < D; i++) if (t[i][j[i]] < m) m = t[i][j[i]]; return m; }

int main(void) {
    const char *keys[] = {"apple", "banana", "cherry", "grape", "lemon"};
    int cnt[] = {5, 2, 3, 1, 4};
    for (int i = 0; i < 5; i++) update(keys[i], cnt[i]);
    for (int i = 0; i < D; i++) { for (int j = 0; j < W; j++) printf(j ? " %d" : "%d", t[i][j]); printf("\n"); }
    const char *qs[] = {"apple", "banana", "cherry", "grape", "lemon", "kiwi"};
    for (int q = 0; q < 6; q++) {
        int real = q < 5 ? cnt[q] : 0, est = query(qs[q]);
        printf("%s: estimate %d, true %d, ok %s\n", qs[q], est, real, est >= real ? "True" : "False");
    }
    return 0;
}
