#include <stdio.h>
#include <string.h>

/* isPal 預算回文區間；cut[j] = 0（整段回文）或 min(cut[i−1] + 1) */
static void solve(const char *s) {
    int n = (int)strlen(s), P[32][32] = {{0}}, cut[32], prev[32];
    if (!n) { printf("'': 0 cuts \n"); return; }
    for (int len = 1; len <= n; len++)
        for (int i = 0; i + len - 1 < n; i++) { int j = i + len - 1; P[i][j] = s[i] == s[j] && (len < 3 || P[i + 1][j - 1]); }
    for (int j = 0; j < n; j++) {
        if (P[0][j]) { cut[j] = 0; prev[j] = 0; continue; }
        cut[j] = n;
        for (int i = 1; i <= j; i++) if (P[i][j] && cut[i - 1] + 1 < cut[j]) { cut[j] = cut[i - 1] + 1; prev[j] = i; }
    }
    int starts[32], ends[32], k = 0;
    for (int j = n - 1; j >= 0; j = prev[j] - 1) { starts[k] = prev[j]; ends[k] = j; k++; }
    printf("'%s': %d cuts ", s, cut[n - 1]);
    for (int t = k - 1; t >= 0; t--) printf(t == k - 1 ? "%.*s" : " | %.*s", ends[t] - starts[t] + 1, s + starts[t]);
    printf("\n");
}

int main(void) {
    solve("aabbcbbdd");
    solve("aab");
    solve("racecar");
    solve("abcde");
    solve("");
    return 0;
}
