#include <algorithm>
#include <iostream>
#include <vector>
using namespace std;

// 重量以「乘上 100 的整數」表示，避免浮點數誤差（3.14 -> 314）
vector<int> w = {200, 314, 198, 500, 300}, v = {40, 50, 100, 95, 30}, order, chosen, bestSet;
int n = 5, W = 1000, best = 0, nodes = 0;

// 上界：剩下的物品依單位價值貪婪裝入，最後一件可以只裝一部分（分數背包的解一定不比整數解差）
double bound(int k, int cap, int value) {
    double val = value;
    for (int t = k; t < n; t++) {
        int i = order[t];
        if (w[i] <= cap) { cap -= w[i]; val += v[i]; }
        else return val + (double)v[i] * cap / w[i];
    }
    return val;
}

// 分支：第 k 件拿或不拿；限界：上界不超過目前最佳解就剪掉整棵子樹
void dfs(int k, int cap, int value) {
    nodes++;
    if (value > best) { best = value; bestSet = chosen; }
    if (k == n || bound(k, cap, value) <= best + 1e-9) return;
    int i = order[k];
    if (w[i] <= cap) {
        chosen.push_back(i);
        dfs(k + 1, cap - w[i], value + v[i]);
        chosen.pop_back();
    }
    dfs(k + 1, cap, value);
}

int main() {
    for (int i = 0; i < n; i++) order.push_back(i);
    stable_sort(order.begin(), order.end(), [](int a, int b) { return (double)v[a] / w[a] > (double)v[b] / w[b]; });
    dfs(0, W, 0);
    sort(bestSet.begin(), bestSet.end());
    cout << "best value = " << best << "\nitems:";
    for (int i : bestSet) cout << " I" << i;
    cout << "\nnodes explored = " << nodes << "\n";
}
