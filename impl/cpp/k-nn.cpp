#include <algorithm>
#include <array>
#include <cstdio>
#include <map>
#include <vector>
using namespace std;

// 找出離查詢點最近的 k 筆訓練資料，以多數決決定類別（票數相同時取編號小的類別）
int main() {
    vector<array<int, 3>> T = {{{2, 3, 0}}, {{3, 5, 0}}, {{4, 2, 0}}, {{1, 6, 0}}, {{5, 4, 0}}, {{3, 3, 0}}, {{8, 8, 1}}, {{9, 6, 1}},
                               {{7, 9, 1}}, {{10, 8, 1}}, {{8, 6, 1}}, {{6, 7, 1}}, {{5, 9, 2}}, {{3, 9, 2}}, {{4, 10, 2}}, {{2, 8, 2}}};
    int qx = 6, qy = 5, K = 5, n = (int)T.size();
    auto d2 = [&](int i) { return (T[i][0] - qx) * (T[i][0] - qx) + (T[i][1] - qy) * (T[i][1] - qy); };
    vector<int> order(n);
    for (int i = 0; i < n; i++) order[i] = i;
    sort(order.begin(), order.end(), [&](int a, int b) { return d2(a) != d2(b) ? d2(a) < d2(b) : a < b; });
    map<int, int> votes;
    for (int t = 0; t < K; t++) {
        int i = order[t];
        printf("neighbor (%d,%d) class %d, d^2 = %d\n", T[i][0], T[i][1], T[i][2], d2(i));
        votes[T[i][2]]++;
    }
    int pred = -1;
    printf("votes:");
    for (auto& v : votes) {
        printf(" class %d=%d", v.first, v.second);
        if (pred < 0 || v.second > votes[pred]) pred = v.first;
    }
    printf("\npredicted class = %d\n", pred);
}
