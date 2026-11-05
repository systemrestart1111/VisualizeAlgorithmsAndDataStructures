#include <stdio.h>
#include <string.h>

/* 節點：葉子存字元；內部節點存左右子節點編號 */
int freq_[64], left_[64], right_[64], cnt;
char ch_[64], code[128][32];

void walk(int u, char *buf, int depth) {
    if (left_[u] < 0) {
        buf[depth] = '\0';
        strcpy(code[(int)ch_[u]], depth ? buf : "0");
        return;
    }
    buf[depth] = '0'; walk(left_[u], buf, depth + 1);
    buf[depth] = '1'; walk(right_[u], buf, depth + 1);
}

/* 每次取出頻率最小的兩棵樹合併（同頻率時保持先後順序），頻率高的字元自然離根較近、編碼較短 */
int main(void) {
    const char *text = "ABRACADABRA BANANA";
    int f[128] = {0}, pq[64], n = 0;
    char seen[128] = {0};
    for (const char *p = text; *p; p++) f[(int)*p]++;
    for (const char *p = text; *p; p++)
        if (!seen[(int)*p]) {
            seen[(int)*p] = 1;
            ch_[cnt] = *p; freq_[cnt] = f[(int)*p]; left_[cnt] = right_[cnt] = -1;
            pq[n++] = cnt++;
        }
    while (n > 1) {
        for (int i = 1; i < n; i++) { /* 穩定的插入排序 */
            int k = pq[i], j = i - 1;
            while (j >= 0 && freq_[pq[j]] > freq_[k]) { pq[j + 1] = pq[j]; j--; }
            pq[j + 1] = k;
        }
        int a = pq[0], b = pq[1];
        freq_[cnt] = freq_[a] + freq_[b]; left_[cnt] = a; right_[cnt] = b;
        for (int i = 2; i < n; i++) pq[i - 2] = pq[i];
        n -= 2;
        pq[n++] = cnt++;
    }
    char buf[32];
    walk(pq[0], buf, 0);
    int bits = 0;
    for (int c = 0; c < 128; c++)
        if (f[c]) {
            printf("%s freq=%d code=%s\n", c == ' ' ? "SP" : (char[]){(char)c, '\0'}, f[c], code[c]);
            bits += f[c] * (int)strlen(code[c]);
        }
    printf("total bits = %d (fixed 8-bit: %d)\n", bits, 8 * (int)strlen(text));
    return 0;
}
