#include <stdio.h>
#include <string.h>

static const char *DICT[] = {"apple", "pen", "applepen", "pine", "pineapple", "cats", "dog", "sand", "and", "cat"};
static int trie[128][26], endw[128], nodes;

static void build(void) {
    memset(trie, 0, sizeof trie);
    nodes = 1;
    for (int i = 0; i < 128; i++) endw[i] = -1;
    for (int w = 0; w < 10; w++) {
        int u = 0;
        for (const char *p = DICT[w]; *p; p++) { int c = *p - 'a'; if (!trie[u][c]) trie[u][c] = nodes++; u = trie[u][c]; }
        endw[u] = w;
    }
}
/* dp[i] = 前 i 個字元的切法數；從每個可到達的 i 沿字典樹往後比對 */
static void solve(const char *s) {
    int n = (int)strlen(s), dp[64] = {0}, fromI[64], fromW[64];
    for (int j = 0; j <= n; j++) fromI[j] = -1;
    dp[0] = 1;
    for (int i = 0; i < n; i++) {
        if (!dp[i]) continue;
        for (int u = 0, j = i; j < n && trie[u][s[j] - 'a'];) {
            u = trie[u][s[j] - 'a'];
            j++;
            if (endw[u] >= 0) { dp[j] += dp[i]; if (fromI[j] < 0) { fromI[j] = i; fromW[j] = endw[u]; } }
        }
    }
    printf("'%s': %d ways", s, dp[n]);
    if (dp[n] && n) {
        int idx[64], k = 0;
        for (int j = n; j > 0; j = fromI[j]) idx[k++] = fromW[j];
        printf(", e.g.");
        for (int i = k - 1; i >= 0; i--) printf(" %s", DICT[idx[i]]);
    }
    printf("\n");
}

int main(void) {
    build();
    solve("pineapplepenapple");
    solve("catsanddog");
    solve("catsandog");
    solve("");
    return 0;
}
