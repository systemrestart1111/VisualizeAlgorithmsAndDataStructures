#include <stdio.h>
#include <string.h>

/* 節點：權重、建立順序、葉子集合（以字元遮罩表示，128 位元拆成兩個 64 位元） */
typedef struct { int w, ord; unsigned long long lo, hi; } Node;
static int has(const Node *n, int c) { return c < 64 ? (int)(n->lo >> c & 1) : (int)(n->hi >> (c - 64) & 1); }

int main(void) {
    const char *text = "abracadabra alakazam";
    int freq[128] = {0}, lens[128] = {0}, syms[128], ns = 0;
    for (const char *p = text; *p; p++) freq[(int)*p]++;
    for (int c = 0; c < 128; c++) if (freq[c]) syms[ns++] = c;
    /* Huffman 只決定碼長；平手時依建立順序（葉子依符號排序在前） */
    Node nodes[128];
    int nn = ns, order = ns;
    for (int i = 0; i < ns; i++) { nodes[i].w = freq[syms[i]]; nodes[i].ord = i; nodes[i].lo = nodes[i].hi = 0; if (syms[i] < 64) nodes[i].lo = 1ULL << syms[i]; else nodes[i].hi = 1ULL << (syms[i] - 64); }
    if (ns == 1) lens[syms[0]] = 1;
    while (nn > 1) {
        for (int i = 1; i < nn; i++) for (int j = i; j > 0 && (nodes[j - 1].w > nodes[j].w || (nodes[j - 1].w == nodes[j].w && nodes[j - 1].ord > nodes[j].ord)); j--) { Node t = nodes[j]; nodes[j] = nodes[j - 1]; nodes[j - 1] = t; }
        Node m = {nodes[0].w + nodes[1].w, order++, nodes[0].lo | nodes[1].lo, nodes[0].hi | nodes[1].hi};
        for (int c = 0; c < 128; c++) if (has(&m, c)) lens[c]++;
        nodes[0] = m;
        for (int i = 1; i < nn - 1; i++) nodes[i] = nodes[i + 1];
        nn--;
    }
    /* 依（碼長, 符號）排序；每個碼是前一個加 1，碼長變長時左移補 0 */
    int ord[128];
    for (int i = 0; i < ns; i++) ord[i] = syms[i];
    for (int i = 1; i < ns; i++) for (int j = i; j > 0 && (lens[ord[j - 1]] > lens[ord[j]] || (lens[ord[j - 1]] == lens[ord[j]] && ord[j - 1] > ord[j])); j--) { int t = ord[j]; ord[j] = ord[j - 1]; ord[j - 1] = t; }
    char codes[128][32];
    int code = 0, prev = lens[ord[0]];
    for (int i = 0; i < ns; i++) {
        int c = ord[i], L = lens[c];
        code <<= L - prev;
        prev = L;
        for (int b = 0; b < L; b++) codes[c][b] = (code >> (L - 1 - b) & 1) ? '1' : '0';
        codes[c][L] = 0;
        code++;
        printf("'%c' len %d code %s\n", c, L, codes[c]);
    }
    char enc[1024] = "", dec[64] = "", buf[32] = "";
    for (const char *p = text; *p; p++) strcat(enc, codes[(int)*p]);
    int nd = 0, nb = 0;
    for (const char *p = enc; *p; p++) {
        buf[nb++] = *p; buf[nb] = 0;
        for (int i = 0; i < ns; i++) if (!strcmp(codes[ord[i]], buf)) { dec[nd++] = (char)ord[i]; nb = 0; buf[0] = 0; break; }
    }
    dec[nd] = 0;
    printf("bits %d, decoded ok %s\n", (int)strlen(enc), strcmp(dec, text) == 0 ? "True" : "False");
    return 0;
}
