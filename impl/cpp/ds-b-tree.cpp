#include <cstdio>
#include <string>
#include <utility>
#include <vector>
using namespace std;

const int T = 2;  // 最小度數：每個節點 T-1 ~ 2T-1 個鍵（T = 2 即 2-3-4 樹）

struct BNode {
    vector<int> keys;
    vector<BNode*> kids;
    bool leaf;
    explicit BNode(bool l) : leaf(l) {}
};

string nodeStr(const BNode* n) {
    string s = "[";
    for (size_t j = 0; j < n->keys.size(); j++) s += (j ? " " : "") + to_string(n->keys[j]);
    return s + "]";
}

// 所有葉節點在同一深度；往下插入時遇到滿節點就先分裂（預先分裂，不必回頭）
class BTree {
    void split(BNode* x, int i) {
        BNode* y = x->kids[i];
        BNode* z = new BNode(y->leaf);
        int mid = y->keys[T - 1];  // 中間鍵上移到父節點
        z->keys.assign(y->keys.begin() + T, y->keys.end());
        y->keys.resize(T - 1);
        if (!y->leaf) {
            z->kids.assign(y->kids.begin() + T, y->kids.end());
            y->kids.resize(T);
        }
        x->keys.insert(x->keys.begin() + i, mid);
        x->kids.insert(x->kids.begin() + i + 1, z);
    }

public:
    BNode* root = new BNode(true);

    void insert(int k) {
        if ((int)root->keys.size() == 2 * T - 1) {  // 根滿了：樹長高一層
            BNode* s = new BNode(false);
            s->kids.push_back(root);
            root = s;
            split(s, 0);
        }
        BNode* x = root;
        while (!x->leaf) {
            int i = 0;
            while (i < (int)x->keys.size() && k > x->keys[i]) i++;
            if ((int)x->kids[i]->keys.size() == 2 * T - 1) {
                split(x, i);
                if (k > x->keys[i]) i++;
            }
            x = x->kids[i];
        }
        int i = 0;
        while (i < (int)x->keys.size() && x->keys[i] < k) i++;
        x->keys.insert(x->keys.begin() + i, k);
    }
    pair<bool, vector<string>> search(int k) const {
        vector<string> path;
        for (BNode* x = root;;) {
            path.push_back(nodeStr(x));
            int i = 0;
            while (i < (int)x->keys.size() && k > x->keys[i]) i++;
            if (i < (int)x->keys.size() && x->keys[i] == k) return {true, path};
            if (x->leaf) return {false, path};
            x = x->kids[i];
        }
    }
    vector<vector<BNode*>> levels() const {
        vector<vector<BNode*>> out;
        vector<BNode*> level{root};
        while (!level.empty()) {
            out.push_back(level);
            vector<BNode*> next;
            for (BNode* n : level) next.insert(next.end(), n->kids.begin(), n->kids.end());
            level = next;
        }
        return out;
    }
};

// 逐層列出節點，層與層之間以 / 分隔
string show(const BTree& t) {
    string s;
    auto lv = t.levels();
    for (size_t d = 0; d < lv.size(); d++) {
        if (d) s += " /";
        for (BNode* n : lv[d]) s += " " + nodeStr(n);
    }
    return s;
}

int main() {
    BTree t;
    for (int k : {10, 20, 5, 6, 12, 30, 7, 17, 3, 25, 28}) {
        t.insert(k);
        printf("insert %2d:%s\n", k, show(t).c_str());
    }
    for (int k : {17, 13}) {
        auto r = t.search(k);
        string p;
        for (size_t j = 0; j < r.second.size(); j++) p += (j ? " -> " : "") + r.second[j];
        printf("search %d: %s, path %s\n", k, r.first ? "found" : "not found", p.c_str());
    }
    printf("height = %d\n", (int)t.levels().size());
}
