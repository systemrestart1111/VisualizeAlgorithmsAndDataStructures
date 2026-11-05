#include <iostream>
#include <map>
#include <memory>
#include <string>
#include <utility>
using namespace std;

struct Node {
    bool end = false;
    map<char, pair<string, Node *>> kids;  // 首字元 → (邊標籤, 子節點)
};

// 共享一部分的邊要在分岔處分裂
void insert(Node *root, const string &w) {
    Node *n = root;
    size_t i = 0;
    while (i < w.size()) {
        auto it = n->kids.find(w[i]);
        if (it == n->kids.end()) { Node *leaf = new Node; leaf->end = true; n->kids[w[i]] = {w.substr(i), leaf}; return; }
        string label = it->second.first;
        Node *child = it->second.second;
        size_t k = 0;
        while (k < label.size() && i + k < w.size() && label[k] == w[i + k]) k++;
        if (k == label.size()) { n = child; i += k; continue; }
        Node *mid = new Node;
        mid->kids[label[k]] = {label.substr(k), child};
        n->kids[w[i]] = {label.substr(0, k), mid};
        n = mid; i += k;
    }
    n->end = true;
}
// 回傳停下的節點（nullptr 表示找不到），mid 表示停在邊的中間
Node *walk(Node *root, const string &w, bool &mid) {
    Node *n = root;
    size_t i = 0;
    mid = false;
    while (i < w.size()) {
        auto it = n->kids.find(w[i]);
        if (it == n->kids.end()) return nullptr;
        const string &label = it->second.first;
        string part = w.substr(i, label.size());
        if (label.compare(0, part.size(), part) != 0) return nullptr;
        if (part.size() < label.size()) { mid = true; return it->second.second; }
        n = it->second.second; i += label.size();
    }
    return n;
}
int count(Node *n) { int s = n->end; for (auto &kv : n->kids) s += count(kv.second.second); return s; }
void dump(Node *n, int depth) {
    for (auto &kv : n->kids) {
        cout << string(2 * depth, ' ') << kv.second.first << (kv.second.second->end ? "*" : "") << "\n";
        dump(kv.second.second, depth + 1);
    }
}

int main() {
    Node root;
    for (string w : {"romane", "romanus", "romulus", "rubens", "ruber", "rubicon", "rubicundus", "rom"}) insert(&root, w);
    dump(&root, 0);
    bool mid;
    for (string w : {"rom", "romane", "rub", "roman"}) { Node *n = walk(&root, w, mid); cout << "search " << w << ": " << (n && !mid && n->end ? "True" : "False") << "\n"; }
    for (string p : {"r", "rom", "rub", "rubi", "ru", "x"}) { Node *n = walk(&root, p, mid); cout << "prefix " << p << ": " << (n ? count(n) : 0) << "\n"; }
}
