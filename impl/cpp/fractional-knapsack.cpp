#include <algorithm>
#include <cstdio>
#include <vector>
using namespace std;

// 依「單位重量價值」由高到低裝；最後一件裝不下就只裝一部分
int main() {
    vector<pair<int, int>> items = {{10, 60}, {20, 100}, {30, 120}, {5, 50}, {15, 45}};  // (重量, 價值)
    int cap = 50, left = cap;
    vector<int> order = {0, 1, 2, 3, 4};
    stable_sort(order.begin(), order.end(), [&](int a, int b) {
        return (double)items[a].second / items[a].first > (double)items[b].second / items[b].first;
    });
    double total = 0;
    for (int i : order) {
        if (left == 0) break;
        int w = items[i].first, v = items[i].second, take = min(w, left);
        total += (double)v * take / w;
        left -= take;
        printf("item %d (w=%d, v=%d, ratio=%.2f): take %d/%d\n", i, w, v, (double)v / w, take, w);
    }
    printf("total value = %.2f\n", total);
}
