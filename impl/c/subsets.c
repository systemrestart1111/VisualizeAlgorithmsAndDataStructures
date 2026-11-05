#include <stdio.h>

const char *items[] = {"a", "b", "c"};
int n = 3, cur[8], depth, count;

/* 每個節點都是一個子集合：輸出目前的集合，再嘗試從 start 之後加入下一個元素 */
void bt(int start) {
    printf("{");
    for (int i = 0; i < depth; i++) printf(i ? " %s" : "%s", items[cur[i]]);
    printf("}\n");
    count++;
    for (int i = start; i < n; i++) {
        cur[depth++] = i;
        bt(i + 1);
        depth--;
    }
}

int main(void) {
    bt(0);
    printf("count = %d\n", count);
    return 0;
}
