#include <stdio.h>

int parent[26];

int find(int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; } /* 路徑壓縮 */
    return x;
}

int main(void) {
    const char *E = "AB BC CA DE FG GH HF FI";
    int n = 10; /* A..J，J 是孤立點 */
    for (int i = 0; i < n; i++) parent[i] = i;
    /* 用並查集合併每條邊的兩端，最後同一個根的點屬於同一個連通分量 */
    for (const char *p = E; *p; p += p[2] ? 3 : 2) parent[find(p[0] - 'A')] = find(p[1] - 'A');
    int done[26] = {0}, cnt = 0;
    for (int i = 0; i < n; i++) if (find(i) == i) cnt++;
    printf("components: %d\n", cnt);
    for (int i = 0; i < n; i++) {
        int r = find(i);
        if (done[r]) continue;
        done[r] = 1;
        printf(" ");
        for (int j = 0; j < n; j++) if (find(j) == r) printf(" %c", 'A' + j);
        printf("\n");
    }
    return 0;
}
