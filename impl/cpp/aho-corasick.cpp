#include <cstring>
#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;

int main() {
    vector<string> patterns = {"he", "she", "his", "hers"};
    string text = "ushershishe";
    vector<vector<int>> child(1, vector<int>(26, -1));
    vector<int> fail(1, 0), out(1, -1), dictLink(1, 0);
    // 1. 把所有樣式插入字典樹
    for (int idx = 0; idx < (int)patterns.size(); idx++) {
        int u = 0;
        for (char ch : patterns[idx]) {
            int c = ch - 'a';
            if (child[u][c] < 0) {
                child[u][c] = (int)child.size();
                child.push_back(vector<int>(26, -1));
                fail.push_back(0); out.push_back(-1); dictLink.push_back(0);
            }
            u = child[u][c];
        }
        out[u] = idx;
    }
    // 2. BFS 建立失配指標：fail[v] = v 所代表字串的最長「也在字典樹中」的真後綴
    queue<int> q;
    for (int c = 0; c < 26; c++) if (child[0][c] >= 0) q.push(child[0][c]);
    while (!q.empty()) {
        int u = q.front();
        q.pop();
        for (int c = 0; c < 26; c++) {
            int v = child[u][c];
            if (v < 0) continue;
            int f = fail[u];
            while (f && child[f][c] < 0) f = fail[f];
            fail[v] = child[f][c] >= 0 && child[f][c] != v ? child[f][c] : 0;
            dictLink[v] = out[fail[v]] >= 0 ? fail[v] : dictLink[fail[v]];  // 沿失配鏈第一個樣式終點
            q.push(v);
        }
    }
    // 3. 掃描文字一次：失配就沿 fail 退回，每到一個節點就輸出它及其輸出鏈上的所有樣式
    int u = 0;
    for (int i = 0; i < (int)text.size(); i++) {
        int c = text[i] - 'a';
        while (u && child[u][c] < 0) u = fail[u];
        u = child[u][c] >= 0 ? child[u][c] : 0;
        for (int x = out[u] >= 0 ? u : dictLink[u]; x; x = dictLink[x])
            cout << "pos " << i - (int)patterns[out[x]].size() + 1 << ": " << patterns[out[x]] << "\n";
    }
}
