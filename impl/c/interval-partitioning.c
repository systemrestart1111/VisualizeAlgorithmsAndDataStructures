#include <stdio.h>
#include <stdlib.h>

typedef struct { int s, e; } Iv;
static int cmp(const void *a, const void *b) {
    const Iv *x = a, *y = b;
    return x->s != y->s ? x->s - y->s : x->e - y->e;
}

/* 依開始時間處理；記錄每間教室的結束時間，最早空出的教室若來得及就沿用，否則開新教室 */
int main(void) {
    Iv iv[] = {{0, 3}, {1, 4}, {2, 6}, {4, 7}, {5, 9}, {6, 8}, {7, 10}, {9, 12}, {8, 11}, {11, 13}};
    int n = 10, rooms = 0, room_end[16];
    qsort(iv, n, sizeof(Iv), cmp);
    for (int i = 0; i < n; i++) {
        int best = -1; /* (結束時間, 編號) 最小的教室，相當於堆積頂端 */
        for (int r = 0; r < rooms; r++)
            if (best < 0 || room_end[r] < room_end[best]) best = r;
        int r;
        if (best >= 0 && room_end[best] <= iv[i].s) r = best;
        else r = rooms++;
        room_end[r] = iv[i].e;
        printf("[%d,%d) -> room %d\n", iv[i].s, iv[i].e, r);
    }
    printf("rooms needed = %d\n", rooms);
    return 0;
}
