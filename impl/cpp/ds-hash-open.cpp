#include <cstdio>
#include <string>
#include <vector>
using namespace std;

// 所有鍵都放在同一個陣列；碰撞時線性探測下一格。刪除要留「墓碑」，否則會截斷後面鍵的探測路徑
const int EMPTY = -1, DELETED = -2;

class OpenAddressingTable {
    vector<int> slots;

public:
    explicit OpenAddressingTable(int m) : slots(m, EMPTY) {}
    int insert(int k) {
        int m = (int)slots.size(), firstTomb = -1;
        for (int i = 0; i < m; i++) {
            int idx = (k + i) % m;
            if (slots[idx] == k) return idx;  // 已存在
            if (slots[idx] == DELETED && firstTomb < 0) firstTomb = idx;  // 先記下來，繼續往後確認 k 不存在
            if (slots[idx] == EMPTY) {
                int target = firstTomb >= 0 ? firstTomb : idx;
                slots[target] = k;
                return target;
            }
        }
        if (firstTomb >= 0) { slots[firstTomb] = k; return firstTomb; }
        return -1;  // 表已滿
    }
    pair<int, int> search(int k) const {
        int m = (int)slots.size(), probes = 0;
        for (int i = 0; i < m; i++) {
            int idx = (k + i) % m;
            probes++;
            if (slots[idx] == EMPTY) return {-1, probes};
            if (slots[idx] == k) return {idx, probes};
        }
        return {-1, probes};
    }
    bool remove(int k) {
        int idx = search(k).first;
        if (idx >= 0) slots[idx] = DELETED;
        return idx >= 0;
    }
    string str() const {
        string s;
        for (size_t i = 0; i < slots.size(); i++)
            s += (i ? " " : "") + (slots[i] == EMPTY ? string(".") : slots[i] == DELETED ? string("X") : to_string(slots[i]));
        return s;
    }
};

int main() {
    OpenAddressingTable t(11);
    for (int k : {22, 1, 13, 11, 24, 33, 18}) {
        int s = t.insert(k);
        printf("insert %2d -> slot %2d   [%s]\n", k, s, t.str().c_str());
    }
    auto r = t.search(33);
    printf("search 33 -> (slot, probes) = (%d, %d)\n", r.first, r.second);
    bool ok = t.remove(13);
    printf("delete 13 -> %s   [%s]\n", ok ? "True" : "False", t.str().c_str());
    r = t.search(24);
    printf("search 24 -> (slot, probes) = (%d, %d) (passes the tombstone)\n", r.first, r.second);
    int s = t.insert(35);
    printf("insert 35 -> slot %2d   [%s] (reuses the tombstone)\n", s, t.str().c_str());
}
