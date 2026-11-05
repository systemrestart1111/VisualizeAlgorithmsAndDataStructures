#include <ctype.h>
#include <stdio.h>
#include <string.h>

static char sq[26];
static int pr[26], pc[26];

/* 關鍵字（J 視為 I，去重複）接上其餘字母，排成 5×5 */
void build(const char *key) {
    char all[128];
    int used[26] = {0}, n = 0;
    snprintf(all, sizeof all, "%sABCDEFGHIKLMNOPQRSTUVWXYZ", key);
    for (char *p = all; *p; p++) {
        if (!isalpha((unsigned char)*p)) continue;
        char ch = (char)toupper((unsigned char)*p);
        if (ch == 'J') ch = 'I';
        if (!used[ch - 'A']) { used[ch - 'A'] = 1; pr[ch - 'A'] = n / 5; pc[ch - 'A'] = n % 5; sq[n++] = ch; }
    }
}

/* 相同字母中間插 X（XX 則插 Q），奇數長度補 X（末字為 X 則補 Q） */
int pairs_of(const char *text, char *out) {
    char t[256];
    int n = 0, k = 0;
    for (const char *p = text; *p; p++) if (isalpha((unsigned char)*p)) { char ch = (char)toupper((unsigned char)*p); t[n++] = ch == 'J' ? 'I' : ch; }
    for (int i = 0; i < n;) {
        char a = t[i], b;
        if (i + 1 >= n || t[i + 1] == a) { b = a == 'X' ? 'Q' : 'X'; i += 1; }
        else { b = t[i + 1]; i += 2; }
        out[k++] = a; out[k++] = b;
    }
    out[k] = 0;
    return k;
}

void playfair(const char *in, int d, char *out) {
    int n = (int)strlen(in);
    for (int i = 0; i < n; i += 2) {
        int a = in[i] - 'A', b = in[i + 1] - 'A';
        int ra = pr[a], ca = pc[a], rb = pr[b], cb = pc[b];
        if (ra == rb) { out[i] = sq[ra * 5 + (ca + d) % 5]; out[i + 1] = sq[rb * 5 + (cb + d) % 5]; }
        else if (ca == cb) { out[i] = sq[(ra + d) % 5 * 5 + ca]; out[i + 1] = sq[(rb + d) % 5 * 5 + cb]; }
        else { out[i] = sq[ra * 5 + cb]; out[i + 1] = sq[rb * 5 + ca]; }
    }
    out[n] = 0;
}

void show(const char *label, const char *s) {
    printf("%s", label);
    for (int i = 0; s[i]; i += 2) printf("%s%c%c", i ? " " : "", s[i], s[i + 1]);
    printf("\n");
}

int main(void) {
    char p[256], c[256], back[256];
    build("PLAYFAIR EXAMPLE");
    for (int r = 0; r < 5; r++) printf("%c %c %c %c %c\n", sq[r * 5], sq[r * 5 + 1], sq[r * 5 + 2], sq[r * 5 + 3], sq[r * 5 + 4]);
    pairs_of("HIDE THE GOLD IN THE TREE STUMP", p);
    playfair(p, 1, c);
    show("cipher: ", c);
    playfair(c, 4, back);
    show("plain : ", back);
    return 0;
}
