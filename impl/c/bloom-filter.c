#include <stdio.h>
#include <string.h>

typedef long long ll;
static ll poly(const char *s, ll base, ll mod) { ll h = 0; for (; *s; s++) h = (h * base + (unsigned char)*s) % mod; return h; }

#define M 32
#define K 3
static int bits[M];

/* 雙重雜湊：h_i = (h1 + i·h2) mod m */
static void hashes(const char *s, int *out) {
    ll h1 = poly(s, 31, 1000000007), h2 = poly(s, 37, 998244353) | 1;
    for (int i = 0; i < K; i++) out[i] = (int)((h1 + i * h2) % M);
}
static void add(const char *s) { int p[K]; hashes(s, p); for (int i = 0; i < K; i++) bits[p[i]] = 1; }
/* 有任一位元為 0 → 確定不存在；全為 1 → 可能存在 */
static int might_contain(const char *s) { int p[K]; hashes(s, p); for (int i = 0; i < K; i++) if (!bits[p[i]]) return 0; return 1; }

int main(void) {
    const char *ins[] = {"apple", "banana", "cherry", "grape"};
    const char *qs[] = {"apple", "banana", "cherry", "grape", "kiwi", "lemon", "mango", "peach", "plum", "fig"};
    for (int i = 0; i < 4; i++) add(ins[i]);
    printf("bits: ");
    for (int i = 0; i < M; i++) printf("%d", bits[i]);
    printf("\n");
    for (int q = 0; q < 10; q++) {
        int maybe = might_contain(qs[q]), was = 0;
        for (int i = 0; i < 4; i++) if (!strcmp(ins[i], qs[q])) was = 1;
        printf("%s: %s%s\n", qs[q], maybe ? "maybe" : "no", maybe && !was ? " (false positive)" : "");
    }
    return 0;
}
