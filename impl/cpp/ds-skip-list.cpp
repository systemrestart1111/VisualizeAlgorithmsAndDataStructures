#include <cstdio>
#include <string>
#include <vector>
using namespace std;

const int MAX_LEVEL = 4;

struct SNode {
    int val;
    vector<SNode*> next;
    SNode(int v, int level) : val(v), next(level, nullptr) {}
};

// 多層排序串列：每個節點以 1/2 機率往上多一層，搜尋時從最高層往下跳，期望 O(log n)
class SkipList {
    SNode* head = new SNode(0, MAX_LEVEL);
    int level = 1;
    long long state = 42;  // Park–Miller 亂數，讓每種語言都得到相同的層數

    int randInt(int k) {
        state = state * 48271 % 2147483647;
        return (int)(state % k);
    }
    int randomLevel() {
        int lvl = 1;
        while (lvl < MAX_LEVEL && randInt(2) == 0) lvl++;
        return lvl;
    }
    // 回傳每一層「最後一個 < k 的節點」
    vector<SNode*> findUpdate(int k) const {
        vector<SNode*> update(MAX_LEVEL, head);
        SNode* x = head;
        for (int i = level - 1; i >= 0; i--) {
            while (x->next[i] && x->next[i]->val < k) x = x->next[i];
            update[i] = x;
        }
        return update;
    }

public:
    int insert(int k) {
        vector<SNode*> update = findUpdate(k);
        SNode* nxt = update[0]->next[0];
        if (nxt && nxt->val == k) return 0;
        int lvl = randomLevel();
        if (lvl > level) level = lvl;
        SNode* n = new SNode(k, lvl);
        for (int i = 0; i < lvl; i++) { n->next[i] = update[i]->next[i]; update[i]->next[i] = n; }
        return lvl;
    }
    bool search(int k, vector<int>& visited) const {
        SNode* x = head;
        for (int i = level - 1; i >= 0; i--)
            while (x->next[i] && x->next[i]->val < k) { x = x->next[i]; visited.push_back(x->val); }
        x = x->next[0];
        return x && x->val == k;
    }
    bool remove(int k) {
        vector<SNode*> update = findUpdate(k);
        SNode* x = update[0]->next[0];
        if (!x || x->val != k) return false;
        for (size_t i = 0; i < x->next.size(); i++) update[i]->next[i] = x->next[i];
        delete x;
        while (level > 1 && !head->next[level - 1]) level--;
        return true;
    }
    void show() const {
        for (int i = level - 1; i >= 0; i--) {
            printf("  L%d:", i);
            for (SNode* x = head->next[i]; x; x = x->next[i]) printf(" %d", x->val);
            printf("\n");
        }
    }
};

int main() {
    SkipList s;
    for (int k : {30, 10, 50, 20, 70, 40, 60, 80, 25}) { int lvl = s.insert(k); printf("insert %d (level %d)\n", k, lvl); }
    s.show();
    for (int k : {60, 45}) {
        vector<int> visited;
        bool found = s.search(k, visited);
        printf("search %d: %s, visited", k, found ? "found" : "not found");
        for (int v : visited) printf(" %d", v);
        printf("\n");
    }
    printf("delete 40 -> %s\n", s.remove(40) ? "True" : "False");
    s.show();
}
