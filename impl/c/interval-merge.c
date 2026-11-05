#include <stdio.h>
#include <stdlib.h>

typedef struct { int l, r; } Iv;
static int cmp(const void *x, const void *y) { const Iv *a = x, *b = y; return a->l != b->l ? a->l - b->l : a->r - b->r; }

/* 依左端點排序；touch=1 時相接的閉區間（如 [1,3] 與 [3,5]）也合併；回傳區間數 */
int merge(Iv *iv, int n, int touch, Iv *out) {
    qsort(iv, n, sizeof(Iv), cmp);
    int k = 0;
    for (int i = 0; i < n; i++) {
        if (k && (touch ? iv[i].l <= out[k - 1].r : iv[i].l < out[k - 1].r)) { if (iv[i].r > out[k - 1].r) out[k - 1].r = iv[i].r; }
        else out[k++] = iv[i];
    }
    return k;
}

void show(const char *label, Iv *v, int k) {
    printf("%s", label);
    for (int i = 0; i < k; i++) printf(i ? " [%d,%d]" : "[%d,%d]", v[i].l, v[i].r);
    printf("\n");
}

int main(void) {
    Iv iv[6] = {{1, 3}, {8, 10}, {2, 6}, {10, 12}, {15, 18}, {17, 20}}, out[6], one[1] = {{5, 5}};
    show("merge touching: ", out, merge(iv, 6, 1, out));
    show("keep touching : ", out, merge(iv, 6, 0, out));
    show("single        : ", out, merge(one, 1, 1, out));
    return 0;
}
