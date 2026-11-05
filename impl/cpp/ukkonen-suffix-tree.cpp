#include <algorithm>
#include <iostream>
#include <map>
#include <memory>
#include <numeric>
#include <string>
#include <vector>
using namespace std;

struct Node {
    int start;
    shared_ptr<int> end;
    map<char, Node *> kids;
    Node *link = nullptr;
    Node(int s, shared_ptr<int> e) : start(s), end(e) {}
    int len() const { return *end - start + 1; }
};

// Ukkonen：葉子共用全域 end；active point 記住插入位置；新內部節點以 suffix link 串接
Node *build(const string &t) {
    auto leafEnd = make_shared<int>(-1);
    Node *root = new Node(-1, make_shared<int>(-1));
    root->link = root;
    Node *aNode = root;
    int aEdge = 0, aLen = 0, rem = 0;
    for (int i = 0; i < (int)t.size(); i++) {
        *leafEnd = i;
        rem++;
        Node *lastNew = nullptr;
        while (rem > 0) {
            if (aLen == 0) aEdge = i;
            char ch = t[aEdge];
            if (!aNode->kids.count(ch)) {
                aNode->kids[ch] = new Node(i, leafEnd);
                if (lastNew) { lastNew->link = aNode; lastNew = nullptr; }
            } else {
                Node *nx = aNode->kids[ch];
                if (aLen >= nx->len()) { aEdge += nx->len(); aLen -= nx->len(); aNode = nx; continue; }
                if (t[nx->start + aLen] == t[i]) {
                    if (lastNew && aNode != root) { lastNew->link = aNode; lastNew = nullptr; }
                    aLen++;
                    break;
                }
                Node *split = new Node(nx->start, make_shared<int>(nx->start + aLen - 1));
                split->link = root;
                aNode->kids[ch] = split;
                split->kids[t[i]] = new Node(i, leafEnd);
                nx->start += aLen;
                split->kids[t[nx->start]] = nx;
                if (lastNew) lastNew->link = split;
                lastNew = split;
            }
            rem--;
            if (aNode == root && aLen > 0) { aLen--; aEdge = i - rem + 1; }
            else if (aNode != root) aNode = aNode->link;
        }
    }
    return root;
}
// 依邊的首字元字典序 DFS，葉子的出現順序就是後綴陣列
void dfs(Node *n, int depth, int total, vector<int> &out) {
    if (n->kids.empty()) { out.push_back(total - depth); return; }
    for (auto &kv : n->kids) dfs(kv.second, depth + kv.second->len(), total, out);
}

int main() {
    for (string s : {"banana", "abcabxabcd", "mississippi", "aaaa"}) {
        string t = s + "$";
        vector<int> sa, naive(t.size());
        dfs(build(t), 0, t.size(), sa);
        iota(naive.begin(), naive.end(), 0);
        sort(naive.begin(), naive.end(), [&](int a, int b) { return t.substr(a) < t.substr(b); });
        cout << t << ": leaves " << sa.size() << ", suffix array [";
        for (size_t i = 0; i < sa.size(); i++) cout << (i ? ", " : "") << sa[i];
        cout << "], matches naive " << (sa == naive ? "True" : "False") << "\n";
    }
}
