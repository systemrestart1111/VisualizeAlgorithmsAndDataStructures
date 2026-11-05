#include <stdio.h>
#include <string.h>

/* 每個字母位移 k 格（mod 26），保留大小寫，非字母原樣輸出 */
void caesar(const char *in, int k, char *out) {
    k = ((k % 26) + 26) % 26;
    size_t n = strlen(in);
    for (size_t i = 0; i < n; i++) {
        char ch = in[i];
        if (ch >= 'A' && ch <= 'Z') out[i] = (char)('A' + (ch - 'A' + k) % 26);
        else if (ch >= 'a' && ch <= 'z') out[i] = (char)('a' + (ch - 'a' + k) % 26);
        else out[i] = ch;
    }
    out[n] = 0;
}

int main(void) {
    const char *msg = "Hello, World! XYZ";
    char c[64], p[64];
    caesar(msg, 3, c);
    printf("encrypt k=3: %s\n", c);
    caesar(c, -3, p);
    printf("decrypt   : %s\n", p);
    int ks[] = {0, 25, 26};
    for (int i = 0; i < 3; i++) { caesar(msg, ks[i], c); printf("k=%d: %s\n", ks[i], c); }
    return 0;
}
