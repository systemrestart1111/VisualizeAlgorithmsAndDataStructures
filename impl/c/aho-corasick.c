#include <stdio.h>
#include <string.h>

#define MAXN 64
int child[MAXN][26], fail_[MAXN], out[MAXN], dict_link[MAXN], cnt = 1;
const char *PATTERNS[] = {"he", "she", "his", "hers"};

int main(void) {
    const char *text = "ushershishe";
    memset(child, -1, sizeof child);
    out[0] = -1;
    /* 1. 把所有樣式插入字典樹 */
    for (int idx = 0; idx < 4; idx++) {
        int u = 0;
        for (const char *p = PATTERNS[idx]; *p; p++) {
            int c = *p - 'a';
            if (child[u][c] < 0) { out[cnt] = -1; child[u][c] = cnt++; }
            u = child[u][c];
        }
        out[u] = idx;
    }
    /* 2. BFS 建立失配指標：fail[v] = v 所代表字串的最長「也在字典樹中」的真後綴 */
    int q[MAXN], head = 0, tail = 0;
    for (int c = 0; c < 26; c++) if (child[0][c] >= 0) q[tail++] = child[0][c];
    while (head < tail) {
        int u = q[head++];
        for (int c = 0; c < 26; c++) {
            int v = child[u][c];
            if (v < 0) continue;
            int f = fail_[u];
            while (f && child[f][c] < 0) f = fail_[f];
            fail_[v] = child[f][c] >= 0 && child[f][c] != v ? child[f][c] : 0;
            dict_link[v] = out[fail_[v]] >= 0 ? fail_[v] : dict_link[fail_[v]]; /* 沿失配鏈第一個樣式終點 */
            q[tail++] = v;
        }
    }
    /* 3. 掃描文字一次：失配就沿 fail 退回，每到一個節點就輸出它及其輸出鏈上的所有樣式 */
    int u = 0;
    for (int i = 0; text[i]; i++) {
        int c = text[i] - 'a';
        while (u && child[u][c] < 0) u = fail_[u];
        u = child[u][c] >= 0 ? child[u][c] : 0;
        for (int x = out[u] >= 0 ? u : dict_link[u]; x; x = dict_link[x]) {
            const char *p = PATTERNS[out[x]];
            printf("pos %d: %s\n", i - (int)strlen(p) + 1, p);
        }
    }
    return 0;
}
