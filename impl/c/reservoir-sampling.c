#include <stdio.h>

long long state = 42;

/* Park–Miller 亂數產生器（五種語言結果相同），回傳 0..k-1 */
int rand_int(int k) {
    state = state * 48271 % 2147483647;
    return (int)(state % k);
}

/* 演算法 R：先放前 k 個；第 i 個（0 起算）元素以 k/(i+1) 的機率取代蓄水池中隨機一格
   不需事先知道串流長度，最後每個元素被選中的機率都是 k/n */
int main(void) {
    int stream[] = {12, 45, 7, 33, 89, 21, 64, 3, 58, 90, 17, 76, 40, 5, 61}, n = 15, K = 4, res[4];
    for (int i = 0; i < K; i++) res[i] = stream[i];
    for (int i = K; i < n; i++) {
        int j = rand_int(i + 1);
        if (j < K) {
            printf("item %d replaces slot %d (%d)\n", stream[i], j, res[j]);
            res[j] = stream[i];
        }
    }
    printf("sample:");
    for (int i = 0; i < K; i++) printf(" %d", res[i]);
    printf("\n");
    return 0;
}
