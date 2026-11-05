#include <stdio.h>

const char *items[] = {"1", "2", "3"};
int n = 3, used[3], cur[3], depth;

/* 每一層選一個還沒用過的元素放進目前位置，到底就輸出；返回時把它標回未使用（回溯） */
void bt(void) {
    if (depth == n) {
        for (int i = 0; i < n; i++) printf(i ? " %s" : "%s", items[cur[i]]);
        printf("\n");
        return;
    }
    for (int i = 0; i < n; i++)
        if (!used[i]) {
            used[i] = 1;
            cur[depth++] = i;
            bt();
            depth--;
            used[i] = 0;
        }
}

int main(void) {
    bt();
    return 0;
}
