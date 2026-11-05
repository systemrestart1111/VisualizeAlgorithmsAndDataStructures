#include <stdio.h>
#include <string.h>

#define N 8
/* 工作依前置先後列出；deps 以字母字串表示 */
static const char names[N] = {'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'};
static const int dur[N] = {3, 2, 4, 2, 2, 3, 4, 1};
static const char *deps[N] = {"", "A", "A", "B", "C", "DE", "", "G"};

int main(void) {
    int ES[N], EF[N], LS[N], LF[N], T = 0;
    /* 正向算 ES/EF */
    for (int i = 0; i < N; i++) {
        ES[i] = 0;
        for (const char *p = deps[i]; *p; p++) if (EF[*p - 'A'] > ES[i]) ES[i] = EF[*p - 'A'];
        EF[i] = ES[i] + dur[i];
        if (EF[i] > T) T = EF[i];
    }
    /* 反向算 LS/LF；浮時 0 為關鍵工作 */
    for (int i = N - 1; i >= 0; i--) {
        LF[i] = T;
        for (int j = 0; j < N; j++) if (strchr(deps[j], names[i]) && LS[j] < LF[i]) LF[i] = LS[j];
        LS[i] = LF[i] - dur[i];
    }
    printf("project duration: %d\ntask dur ES EF LS LF slack\n", T);
    for (int i = 0; i < N; i++) printf("%4c %3d %2d %2d %2d %2d %5d\n", names[i], dur[i], ES[i], EF[i], LS[i], LF[i], LS[i] - ES[i]);
    printf("critical:");
    for (int i = 0; i < N; i++) if (LS[i] == ES[i]) printf(" %c", names[i]);
    printf("\n");
    return 0;
}
