#include <algorithm>
#include <iostream>
#include <string>
#include <vector>
using namespace std;

const vector<string> E = {"AB", "AC", "AD", "BC", "BD", "CD", "DE", "EF", "EG", "FG", "FH", "GH", "EH"};
const int N = 8;
long long seed = 42;
int rnd(int n) { seed = seed * 48271 % 2147483647; return int(seed % n); }

// 隨機縮邊直到剩兩個超節點；兩者之間的邊數就是一個割
int trial() {
    vector<int> p(N);
    for (int i = 0; i < N; i++) p[i] = i;
    auto find = [&](int x) { while (p[x] != x) x = p[x]; return x; };
    for (int groups = N; groups > 2; groups--) {
        vector<int> live;
        for (size_t i = 0; i < E.size(); i++) if (find(E[i][0] - 'A') != find(E[i][1] - 'A')) live.push_back(i);
        int i = live[rnd(live.size())];
        p[find(E[i][0] - 'A')] = find(E[i][1] - 'A');
    }
    int cut = 0;
    for (auto &e : E) if (find(e[0] - 'A') != find(e[1] - 'A')) cut++;
    return cut;
}

int main() {
    int best = E.size(), brute = E.size();
    cout << "cuts per trial:";
    for (int t = 0; t < 6; t++) { int c = trial(); cout << " " << c; best = min(best, c); }
    for (int m = 1; m < (1 << (N - 1)); m++) {
        int c = 0;
        for (auto &e : E) if (((m >> (e[0] - 'A')) & 1) != ((m >> (e[1] - 'A')) & 1)) c++;
        brute = min(brute, c);
    }
    cout << "\nbest: " << best << " | brute force: " << brute << "\n";
}
