#include <stdio.h>

/* 雙指標：較矮那一側的最高牆決定該側水位 */
int trap(const int *h, int n) {
    int l = 0, r = n - 1, lm = 0, rm = 0, water = 0;
    while (l < r) {
        if (h[l] < h[r]) { if (h[l] > lm) lm = h[l]; water += lm - h[l]; l++; }
        else { if (h[r] > rm) rm = h[r]; water += rm - h[r]; r--; }
    }
    return water;
}

int baseline(const int *h, int n) {
    int s = 0;
    for (int i = 0; i < n; i++) {
        int L = 0, R = 0;
        for (int j = 0; j <= i; j++) if (h[j] > L) L = h[j];
        for (int j = i; j < n; j++) if (h[j] > R) R = h[j];
        s += (L < R ? L : R) - h[i];
    }
    return s;
}

void run(const int *h, int n) {
    printf("[");
    for (int i = 0; i < n; i++) printf(i ? ", %d" : "%d", h[i]);
    printf("] water: %d baseline: %d\n", trap(h, n), baseline(h, n));
}

int main(void) {
    int a[] = {0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1}, b[] = {4, 2, 0, 3, 2, 5}, c[] = {1, 2, 3}, d[] = {5};
    run(a, 12); run(b, 6); run(c, 3); run(d, 1);
    return 0;
}
