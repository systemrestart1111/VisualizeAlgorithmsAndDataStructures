#include <stdio.h>
#include <stdlib.h>

/* 尾節點的 next 指回頭節點；只要記住 tail，就能 O(1) 取得頭（tail->next）並在兩端插入 */
typedef struct Node { int val; struct Node *next; } Node;
Node *tail;

void insert_back(int v) {
    Node *n = malloc(sizeof *n);
    n->val = v;
    if (!tail) n->next = n;
    else { n->next = tail->next; tail->next = n; }
    tail = n;
}

int remove_val(int v) {
    if (!tail) return 0;
    Node *prev = tail, *cur = tail->next;
    do {
        if (cur->val == v) {
            if (cur == prev) tail = NULL; /* 只剩一個節點 */
            else {
                prev->next = cur->next;
                if (cur == tail) tail = prev;
            }
            free(cur);
            return 1;
        }
        prev = cur;
        cur = cur->next;
    } while (cur != tail->next);
    return 0;
}

/* 把頭移到尾：只要 tail 往前走一步 */
void rotate(void) { if (tail) tail = tail->next; }

void show(void) {
    if (!tail) { printf("(empty)\n"); return; }
    for (Node *cur = tail->next;; cur = cur->next) {
        printf("%d -> ", cur->val);
        if (cur == tail) break;
    }
    printf("(back to %d)\n", tail->next->val);
}

int main(void) {
    for (int v = 1; v <= 4; v++) insert_back(v);
    printf("init:       "); show();
    rotate(); printf("rotate:     "); show();
    int ok = remove_val(3); printf("remove 3:   %s ", ok ? "True" : "False"); show();
    ok = remove_val(2); printf("remove 2:   %s ", ok ? "True" : "False"); show();
    insert_back(5); printf("insert 5:   "); show();
    return 0;
}
