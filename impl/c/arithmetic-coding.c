#include <stdio.h>
#include <string.h>

long long ipow(long long b, int e) { long long r = 1; while (e--) r *= b; return r; }

/* num / total^k 的十進位表示（total = 5 時恰好是有限小數） */
void dec(long long num, int k, long long total, char *buf) {
    if (k == 0) { sprintf(buf, "%lld", num); return; }
    long long v = num * ipow(10, k) / ipow(total, k), p = ipow(10, k);
    sprintf(buf, "%lld.%0*lld", v / p, k, v % p);
}

/* 依出現頻率把 [0, 1) 切給各符號；每編一個符號就把目前區間縮小到該符號負責的那一段
   區間以分數 low/denom、(low+width)/denom 表示，全程整數運算，沒有浮點誤差 */
int main(void) {
    const char *msg = "BACAB";
    int n = (int)strlen(msg);
    long long freq[128] = {0}, cum[128] = {0}, total = n, acc = 0;
    char syms[128];
    int ns = 0;
    for (int i = 0; i < n; i++) freq[(int)msg[i]]++;
    for (int c = 0; c < 128; c++) if (freq[c]) { syms[ns++] = (char)c; cum[c] = acc; acc += freq[c]; }
    printf("model:");
    for (int i = 0; i < ns; i++) printf(" %c:[%lld/%lld,%lld/%lld)", syms[i], cum[(int)syms[i]], total, cum[(int)syms[i]] + freq[(int)syms[i]], total);
    printf("\n");
    long long low = 0, width = 1;
    char a[64], b[64];
    for (int k = 1; k <= n; k++) {
        int ch = msg[k - 1];
        low = low * total + width * cum[ch];
        width *= freq[ch];
        dec(low, k, total, a);
        dec(low + width, k, total, b);
        printf("after '%c': [%s, %s)\n", ch, a, b);
    }
    dec(low, n, total, a);
    printf("code = %s (= %lld/%lld)\n", a, low, ipow(total, n));
    /* 解碼：看 code 落在哪個符號的區段，再把它放大回 [0, 1) */
    long long num = low, den = ipow(total, n);
    printf("decoded: ");
    for (int k = 0; k < n; k++) {
        long long scaled = num * total;
        int ch = 0;
        for (int i = ns - 1; i >= 0; i--) if (scaled >= cum[(int)syms[i]] * den) { ch = syms[i]; break; }
        printf("%c", ch);
        num = scaled - cum[ch] * den;
        den *= freq[ch];
    }
    printf("\n");
    return 0;
}
