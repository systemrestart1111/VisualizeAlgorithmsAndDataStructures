#include <cstdio>
#include <map>
#include <string>
#include <vector>
using namespace std;

struct TrieNode {
    map<char, TrieNode*> kids;  // map 依鍵排序，走訪時自然是字母序
    bool end = false;
};

// 每條從根出發的路徑代表一個前綴；end 標記「到這裡是一個完整單字」
class Trie {
    TrieNode* root = new TrieNode;

    TrieNode* find(const string& p) const {
        TrieNode* cur = root;
        for (char ch : p) {
            auto it = cur->kids.find(ch);
            if (it == cur->kids.end()) return nullptr;
            cur = it->second;
        }
        return cur;
    }
    void dfs(TrieNode* n, const string& s, vector<string>& out) const {
        if (n->end) out.push_back(s);
        for (auto& kv : n->kids) dfs(kv.second, s + kv.first, out);
    }

public:
    int nodes = 1;

    void insert(const string& w) {
        TrieNode* cur = root;
        for (char ch : w) {
            if (!cur->kids.count(ch)) { cur->kids[ch] = new TrieNode; nodes++; }
            cur = cur->kids[ch];
        }
        cur->end = true;
    }
    bool search(const string& w) const {
        TrieNode* n = find(w);
        return n && n->end;
    }
    vector<string> startsWith(const string& p) const {
        vector<string> out;
        if (TrieNode* n = find(p)) dfs(n, p, out);
        return out;
    }
    bool remove(const string& w) {
        if (!search(w)) return false;
        vector<TrieNode*> path{root};
        for (char ch : w) path.push_back(path.back()->kids[ch]);
        path.back()->end = false;
        for (size_t i = w.size(); i > 0; i--) {  // 從尾端往回剪掉不再需要的節點
            if (path[i]->end || !path[i]->kids.empty()) break;
            delete path[i];
            path[i - 1]->kids.erase(w[i - 1]);
            nodes--;
        }
        return true;
    }
};

string join(const vector<string>& v) {
    if (v.empty()) return "-";
    string s;
    for (size_t i = 0; i < v.size(); i++) s += (i ? " " : "") + v[i];
    return s;
}

const char* b(bool x) { return x ? "True" : "False"; }

int main() {
    Trie t;
    for (const char* w : {"tea", "ten", "to", "inn", "in", "tree", "try"}) t.insert(w);
    printf("words: %s (nodes = %d)\n", join(t.startsWith("")).c_str(), t.nodes);
    printf("search tea -> %s  search te -> %s (prefix only)\n", b(t.search("tea")), b(t.search("te")));
    for (const char* p : {"te", "tr", "x"}) printf("prefix \"%s\": %s\n", p, join(t.startsWith(p)).c_str());
    for (const char* w : {"in", "tree", "tea"}) {
        bool ok = t.remove(w);
        printf("delete %s -> %s: %s (nodes = %d)\n", w, b(ok), join(t.startsWith("")).c_str(), t.nodes);
    }
}
