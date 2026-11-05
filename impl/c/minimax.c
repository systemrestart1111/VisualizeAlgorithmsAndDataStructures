#include <stdio.h>

/* 由下往上：MAX 層取子節點最大值、MIN 層取最小值（根為 MAX，層數交替） */
int main(void) {
    int vals[16] = {3, 5, 6, 9, 1, 2, 0, -1, 8, 4, 7, 2, 5, 1, 3, 6}, n = 16, B = 2, depth = 0;
    for (int p = 1; p < n; p *= B) depth++;
    for (int d = depth - 1; d >= 0; d--) {
        int is_max = d % 2 == 0, m = 0;
        for (int i = 0; i < n; i += B) {
            int v = vals[i];
            for (int k = 1; k < B; k++) v = is_max ? (vals[i + k] > v ? vals[i + k] : v) : (vals[i + k] < v ? vals[i + k] : v);
            vals[m++] = v;
        }
        n = m;
        printf("level %d (%s):", d, is_max ? "MAX" : "MIN");
        for (int i = 0; i < n; i++) printf(" %d", vals[i]);
        printf("\n");
    }
    printf("root value = %d\n", vals[0]);
    return 0;
}
