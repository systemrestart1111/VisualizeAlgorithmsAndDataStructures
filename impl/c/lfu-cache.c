#include <stdio.h>

/* 鍵 0..99；每個鍵記錄值、使用次數與最後使用時間。容量很小，淘汰時線性掃描：
   次數最少者優先，同次數時淘汰最久未用（等同各次數桶內的 LRU） */
static int val[100], freq[100], last[100], has[100], cap, size_, tick;

static void init(int c) { cap = c; size_ = 0; tick = 0; for (int i = 0; i < 100; i++) has[i] = 0; }
static int get(int k) {
    if (!has[k]) return -1;
    freq[k]++; last[k] = ++tick;
    return val[k];
}
static void put(int k, int v) {
    if (cap <= 0) return;
    if (has[k]) { val[k] = v; freq[k]++; last[k] = ++tick; return; }
    if (size_ >= cap) {
        int w = -1;
        for (int i = 0; i < 100; i++)
            if (has[i] && (w < 0 || freq[i] < freq[w] || (freq[i] == freq[w] && last[i] < last[w]))) w = i;
        has[w] = 0; size_--;
    }
    has[k] = 1; val[k] = v; freq[k] = 1; last[k] = ++tick; size_++;
}

int main(void) {
    init(2);
    put(1, 1); put(2, 2);
    printf("get 1 -> %d\n", get(1));
    put(3, 3);
    int a = get(2), b = get(3);
    printf("get 2 -> %d | get 3 -> %d\n", a, b);
    put(4, 4);
    a = get(1); b = get(3);
    int c = get(4);
    printf("get 1 -> %d | get 3 -> %d | get 4 -> %d\n", a, b, c);
    printf("freq:");
    for (int i = 0; i < 100; i++) if (has[i]) printf(" %d:%d", i, freq[i]);
    printf("\n");
    return 0;
}
