#include <stdio.h>

/* 龍書範例：(a|b)*abb 的 5 狀態 DFA；狀態 A..E = 0..4，以位元遮罩表示分組 */
static const int DELTA[5][2] = {{1, 2}, {1, 3}, {1, 2}, {1, 4}, {1, 2}};
static const int ACCEPT = 1 << 4;
static int popcount(int x) { int c = 0; while (x) { c += x & 1; x >>= 1; } return c; }

int main(void) {
    int P[8], np = 0, W[16], nw = 0;
    /* P 從「接受／非接受」開始；用 W 中的分組 A 與字元 c 切開所有分組 */
    P[np++] = ACCEPT; P[np++] = 31 & ~ACCEPT;
    W[nw++] = popcount(P[0]) <= popcount(P[1]) ? P[0] : P[1];
    while (nw) {
        int A = W[0];
        for (int i = 1; i < nw; i++) W[i - 1] = W[i];
        nw--;
        for (int c = 0; c < 2; c++) {
            int X = 0, NP[8], nn = 0;
            for (int q = 0; q < 5; q++) if (A >> DELTA[q][c] & 1) X |= 1 << q;
            for (int k = 0; k < np; k++) {
                int Y = P[k], inter = Y & X, diff = Y & ~X;
                if (inter && diff) {
                    NP[nn++] = inter; NP[nn++] = diff;
                    int wi = -1;
                    for (int i = 0; i < nw; i++) if (W[i] == Y) wi = i;
                    if (wi >= 0) { W[wi] = inter; W[nw++] = diff; }
                    else W[nw++] = popcount(inter) <= popcount(diff) ? inter : diff;
                } else NP[nn++] = Y;
            }
            for (int k = 0; k < nn; k++) P[k] = NP[k];
            np = nn;
        }
    }
    /* 依名稱排序輸出分組 */
    char names[8][6];
    for (int k = 0; k < np; k++) { int t = 0; for (int q = 0; q < 5; q++) if (P[k] >> q & 1) names[k][t++] = 'A' + q; names[k][t] = 0; }
    for (int i = 1; i < np; i++) for (int j = i; j > 0 && names[j - 1][0] > names[j][0]; j--) { char tmp[6]; for (int z = 0; z < 6; z++) { tmp[z] = names[j][z]; names[j][z] = names[j - 1][z]; names[j - 1][z] = tmp[z]; } }
    printf("minimal states: %d groups:", np);
    for (int k = 0; k < np; k++) printf(" {%s}", names[k]);
    printf("\n");
    /* 最小 DFA 以分組代表元素模擬，與原 DFA 比對所有長度 ≤ 6 的字串 */
    int group[5];
    for (int q = 0; q < 5; q++) for (int k = 0; k < np; k++) if (P[k] >> q & 1) group[q] = k;
    int total = 0, same = 0;
    for (int L = 0; L <= 6; L++)
        for (int code = 0; code < (1 << L); code++) {
            int s = 0, g = group[0];
            for (int i = 0; i < L; i++) {
                int c = code >> i & 1;
                s = DELTA[s][c];
                int rep = 0;
                while (!(P[g] >> rep & 1)) rep++;
                g = group[DELTA[rep][c]];
            }
            same += ((ACCEPT >> s & 1) == ((P[g] & ACCEPT) != 0));
            total++;
        }
    printf("same language on %d/%d strings up to length 6\n", same, total);
    return 0;
}
