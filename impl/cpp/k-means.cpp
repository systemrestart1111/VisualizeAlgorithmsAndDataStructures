#include <cstdio>
#include <vector>
using namespace std;

// Lloyd 演算法：重複「每點分給最近的中心」與「中心移到所屬點的平均位置」，直到分群不再改變
// （這裡用前 k 個點當初始中心，方便重現。這組資料的前 3 點都在同一群，結果會卡在局部最佳解（左下群被拆成兩半），可看出初始化的影響；實務上常用 k-means++ 改善）
int main() {
    vector<pair<double, double>> P = {{1, 2}, {2, 1}, {2, 3}, {3, 2}, {7, 8}, {8, 7}, {8, 9}, {9, 8}, {1, 8}, {2, 7}, {2, 9}, {3, 8}};
    const int K = 3, n = (int)P.size();
    vector<pair<double, double>> cent(P.begin(), P.begin() + K);
    vector<int> assign(n, -1);
    for (int it = 1; it <= 20; it++) {
        vector<int> nw(n);
        for (int i = 0; i < n; i++) {
            int best = 0;
            double bd = 1e18;
            for (int c = 0; c < K; c++) {
                double dx = P[i].first - cent[c].first, dy = P[i].second - cent[c].second, d = dx * dx + dy * dy;
                if (d < bd - 1e-9) { best = c; bd = d; }  // 容許誤差：距離相同時固定選編號小的中心
            }
            nw[i] = best;
        }
        if (nw == assign) break;
        assign = nw;
        for (int c = 0; c < K; c++) {
            double sx = 0, sy = 0;
            int m = 0;
            for (int i = 0; i < n; i++) if (assign[i] == c) { sx += P[i].first; sy += P[i].second; m++; }
            if (m) cent[c] = {sx / m, sy / m};
        }
        printf("iteration %d:", it);
        for (auto& c : cent) printf(" (%.4f, %.4f)", c.first, c.second);
        printf("\n");
    }
    printf("labels:");
    for (int a : assign) printf(" %d", a);
    printf("\n");
}
