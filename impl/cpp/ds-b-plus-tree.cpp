#include <algorithm>
#include <cstdio>
#include <string>
#include <utility>
#include <vector>
using namespace std;

const int M = 4;  // 階數：節點的鍵數達到 M 就分裂

struct BPNode {
    vector<int> keys;
    vector<BPNode*> kids;
    bool leaf;
    BPNode* next = nullptr;
    explicit BPNode(bool l) : leaf(l) {}
};

// 資料都在葉節點、內部節點只放索引鍵；葉節點以 next 串成串列，範圍查詢只需沿串列走
class BPlusTree {
    pair<BPNode*, vector<BPNode*>> findLeaf(int k) const {
        BPNode* x = root;
        vector<BPNode*> path{x};
        while (!x->leaf) {
            int i = 0;
            while (i < (int)x->keys.size() && k >= x->keys[i]) i++;
            x = x->kids[i];
            path.push_back(x);
        }
        return {x, path};
    }

public:
    BPNode* root = new BPNode(true);

    void insert(int k) {
        auto fl = findLeaf(k);
        BPNode* leaf = fl.first;
        vector<BPNode*>& path = fl.second;
        if (find(leaf->keys.begin(), leaf->keys.end(), k) != leaf->keys.end()) return;
        leaf->keys.insert(lower_bound(leaf->keys.begin(), leaf->keys.end(), k), k);
        BPNode* node = leaf;
        int d = path.size() - 1;
        while ((int)node->keys.size() >= M) {
            BPNode* nw = new BPNode(node->leaf);
            int mid = (node->keys.size() + 1) / 2, up;
            if (node->leaf) {  // 葉分裂：右半第一個鍵「複製」到父節點
                nw->keys.assign(node->keys.begin() + mid, node->keys.end());
                node->keys.resize(mid);
                nw->next = node->next;
                node->next = nw;
                up = nw->keys[0];
            } else {  // 內部分裂：中間鍵「移動」到父節點
                up = node->keys[mid - 1];
                nw->keys.assign(node->keys.begin() + mid, node->keys.end());
                nw->kids.assign(node->kids.begin() + mid, node->kids.end());
                node->keys.resize(mid - 1);
                node->kids.resize(mid);
            }
            if (d == 0) {  // 分裂到根：樹長高一層
                root = new BPNode(false);
                root->keys = {up};
                root->kids = {node, nw};
                break;
            }
            BPNode* parent = path[d - 1];
            int pi = find(parent->kids.begin(), parent->kids.end(), node) - parent->kids.begin();
            parent->keys.insert(parent->keys.begin() + pi, up);
            parent->kids.insert(parent->kids.begin() + pi + 1, nw);
            node = parent;
            d--;
        }
    }
    bool search(int k) const {
        BPNode* leaf = findLeaf(k).first;
        return find(leaf->keys.begin(), leaf->keys.end(), k) != leaf->keys.end();
    }
    vector<int> range(int a, int b) const {
        vector<int> out;
        for (BPNode* x = findLeaf(a).first; x; x = x->next) {
            for (int k : x->keys) if (k >= a && k <= b) out.push_back(k);
            if (!x->keys.empty() && x->keys.back() > b) break;
        }
        return out;
    }
    vector<vector<BPNode*>> levels() const {
        vector<vector<BPNode*>> out;
        vector<BPNode*> level{root};
        while (!level.empty()) {
            out.push_back(level);
            vector<BPNode*> next;
            for (BPNode* n : level) next.insert(next.end(), n->kids.begin(), n->kids.end());
            level = next;
        }
        return out;
    }
    vector<BPNode*> leaves() const {
        BPNode* x = root;
        while (!x->leaf) x = x->kids[0];
        vector<BPNode*> out;
        for (; x; x = x->next) out.push_back(x);
        return out;
    }
};

string nodeStr(const BPNode* n) {
    string s = "[";
    for (size_t j = 0; j < n->keys.size(); j++) s += (j ? " " : "") + to_string(n->keys[j]);
    return s + "]";
}

const char* b(bool x) { return x ? "True" : "False"; }

int main() {
    BPlusTree t;
    for (int k : {5, 15, 25, 35, 45, 10, 20, 30, 40, 50, 12, 28}) {
        t.insert(k);
        string s;
        auto lv = t.levels();
        for (size_t d = 0; d < lv.size(); d++) {
            if (d) s += " /";
            for (BPNode* n : lv[d]) s += " " + nodeStr(n);
        }
        printf("insert %2d:%s\n", k, s.c_str());
    }
    string ls;
    for (BPNode* n : t.leaves()) ls += (ls.empty() ? "" : " -> ") + nodeStr(n);
    printf("leaves: %s\n", ls.c_str());
    printf("search 28 -> %s  search 33 -> %s\n", b(t.search(28)), b(t.search(33)));
    printf("range [12, 35]:");
    for (int k : t.range(12, 35)) printf(" %d", k);
    printf("\n");
}
