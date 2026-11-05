#include <stdio.h>
#include <string.h>

/* 求婚方 A..D 與被求婚方 X Y Z W 的偏好（由高到低） */
const char *MEN = "ABCD", *WOMEN = "XYZW";
const char *MP[] = {"XYZW", "YXWZ", "XZYW", "ZWXY"};
const char *WP[] = {"BADC", "ACBD", "CDAB", "DBCA"};

int wi(char c) { return (int)(strchr(WOMEN, c) - WOMEN); }
int mi(char c) { return (int)(strchr(MEN, c) - MEN); }

/* 自由的求婚者依序向下一個還沒求過的對象求婚；對方若更喜歡他就換掉現任 */
int main(void) {
    int rank[4][4], nxt[4] = {0}, partner[4], q[64], head = 0, tail = 0;
    for (int w = 0; w < 4; w++) {
        partner[w] = -1;
        for (int i = 0; i < 4; i++) rank[w][mi(WP[w][i])] = i;
    }
    for (int m = 0; m < 4; m++) q[tail++] = m;
    while (head < tail) {
        int m = q[head++], w = wi(MP[m][nxt[m]++]);
        if (partner[w] < 0) {
            partner[w] = m;
            printf("%c proposes %c: accepted\n", MEN[m], WOMEN[w]);
        } else if (rank[w][m] < rank[w][partner[w]]) {
            printf("%c proposes %c: accepted, %c is free again\n", MEN[m], WOMEN[w], MEN[partner[w]]);
            q[tail++] = partner[w];
            partner[w] = m;
        } else {
            printf("%c proposes %c: rejected\n", MEN[m], WOMEN[w]);
            q[tail++] = m;
        }
    }
    printf("stable matching:");
    for (int m = 0; m < 4; m++)
        for (int w = 0; w < 4; w++) if (partner[w] == m) printf(" %c-%c", MEN[m], WOMEN[w]);
    printf("\n");
    return 0;
}
