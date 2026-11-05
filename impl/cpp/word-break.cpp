#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;

vector<string> DICT = {"apple", "pen", "applepen", "pine", "pineapple", "cats", "dog", "sand", "and", "cat"};

// dp[i] = 前 i 個字元的切法數；從每個可到達的 i 沿字典樹往後比對
void solve(const string &s) {
    vector<map<char, int>> trie(1);
    vector<int> endw(1, -1);
    for (size_t w = 0; w < DICT.size(); w++) {
        int u = 0;
        for (char ch : DICT[w]) { if (!trie[u].count(ch)) { trie[u][ch] = trie.size(); trie.emplace_back(); endw.push_back(-1); } u = trie[u][ch]; }
        endw[u] = w;
    }
    int n = s.size();
    vector<long long> dp(n + 1);
    vector<int> fromI(n + 1, -1), fromW(n + 1);
    dp[0] = 1;
    for (int i = 0; i < n; i++) {
        if (!dp[i]) continue;
        for (int u = 0, j = i; j < n && trie[u].count(s[j]);) {
            u = trie[u][s[j]];
            j++;
            if (endw[u] >= 0) { dp[j] += dp[i]; if (fromI[j] < 0) { fromI[j] = i; fromW[j] = endw[u]; } }
        }
    }
    cout << "'" << s << "': " << dp[n] << " ways";
    if (dp[n] && n) {
        vector<string> parts;
        for (int j = n; j > 0; j = fromI[j]) parts.insert(parts.begin(), DICT[fromW[j]]);
        cout << ", e.g.";
        for (auto &p : parts) cout << " " << p;
    }
    cout << "\n";
}

int main() {
    for (string s : {"pineapplepenapple", "catsanddog", "catsandog", ""}) solve(s);
}
