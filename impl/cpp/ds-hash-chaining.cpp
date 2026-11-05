#include <algorithm>
#include <iostream>
#include <list>
#include <vector>
using namespace std;

// 每個桶是一條串列，碰撞的鍵就接在同一條上；負載因子（鍵數 / 桶數）超過 1 時桶數擴為 2m+1 並重新雜湊
class ChainedHashTable {
    vector<list<int>> buckets = vector<list<int>>(5);
    int count = 0;

    void rehash() {
        vector<int> old;
        for (auto& b : buckets) for (int k : b) old.push_back(k);
        buckets.assign(2 * buckets.size() + 1, list<int>());
        count = 0;
        cout << "  -> rehash to m = " << buckets.size() << "\n";
        for (int k : old) insert(k);
    }

public:
    void insert(int k) {
        auto& b = buckets[k % buckets.size()];
        if (find(b.begin(), b.end(), k) != b.end()) return;
        b.push_back(k);
        if (++count > (int)buckets.size()) rehash();
    }
    bool search(int k) const {
        auto& b = buckets[k % buckets.size()];
        return find(b.begin(), b.end(), k) != b.end();
    }
    bool remove(int k) {
        auto& b = buckets[k % buckets.size()];
        auto it = find(b.begin(), b.end(), k);
        if (it == b.end()) return false;
        b.erase(it);
        count--;
        return true;
    }
    void show() const {
        for (size_t i = 0; i < buckets.size(); i++) {
            printf("  [%2d] ", (int)i);
            if (buckets[i].empty()) printf("-");
            bool first = true;
            for (int k : buckets[i]) { printf(first ? "%d" : " -> %d", k); first = false; }
            printf("\n");
        }
    }
};

int main() {
    ChainedHashTable h;
    for (int k : {15, 11, 27, 8, 12, 20}) { cout << "insert " << k << "\n"; h.insert(k); }
    h.show();
    cout << "search 27 -> " << (h.search(27) ? "True" : "False") << "  search 9 -> " << (h.search(9) ? "True" : "False") << "\n";
    cout << "delete 12 -> " << (h.remove(12) ? "True" : "False") << "\n";
    h.show();
}
