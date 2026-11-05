#include <ctype.h>
#include <stdio.h>
#include <string.h>

/* 把連續重複的字元壓成「次數 + 字元」 */
void rle_encode(const char *s, char *out) {
    int k = 0;
    for (int i = 0; s[i];) {
        int j = i;
        while (s[j] == s[i]) j++;
        k += sprintf(out + k, "%d%c", j - i, s[i]);
        i = j;
    }
}

void rle_decode(const char *code, char *out) {
    int num = 0, k = 0;
    for (; *code; code++) {
        if (isdigit((unsigned char)*code)) num = num * 10 + (*code - '0');
        else { while (num--) out[k++] = *code; num = 0; }
    }
    out[k] = '\0';
}

int main(void) {
    const char *s = "WWWWWWWWWWWWBWWWWWWWWWWWWBBBWWWWWWWWWWWWWWWWWWWWWWWWBWWWWWWWWWWWWWW";
    char code[256], dec[256];
    rle_encode(s, code);
    rle_decode(code, dec);
    printf("encoded: %s\nlength %d -> %d, decode ok: %s\n", code, (int)strlen(s), (int)strlen(code), strcmp(dec, s) == 0 ? "True" : "False");
    return 0;
}
