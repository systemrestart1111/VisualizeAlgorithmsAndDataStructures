#include <iostream>
#include <list>
#include <map>
#include <unordered_map>
using namespace std;

// 依使用次數分桶，每桶是一條 LRU（前面最近使用）；追蹤 minFreq
class LFUCache {
    int cap, minFreq = 0;
    unordered_map<int, int> val, freq;
    unordered_map<int, list<int>::iterator> pos;
    unordered_map<int, list<int>> buckets;
    void touch(int k) {
        int f = freq[k];
        buckets[f].erase(pos[k]);
        if (buckets[f].empty() && minFreq == f) minFreq++;
        freq[k] = f + 1;
        buckets[f + 1].push_front(k);
        pos[k] = buckets[f + 1].begin();
    }
public:
    LFUCache(int c) : cap(c) {}
    int get(int k) {
        if (!val.count(k)) return -1;
        touch(k);
        return val[k];
    }
    void put(int k, int v) {
        if (cap <= 0) return;
        if (val.count(k)) { val[k] = v; touch(k); return; }
        if ((int)val.size() >= cap) {
            int old = buckets[minFreq].back();
            buckets[minFreq].pop_back();
            val.erase(old); freq.erase(old); pos.erase(old);
        }
        val[k] = v; freq[k] = 1;
        buckets[1].push_front(k);
        pos[k] = buckets[1].begin();
        minFreq = 1;
    }
    void showFreq() { map<int, int> s(freq.begin(), freq.end()); cout << "freq:"; for (auto &p : s) cout << " " << p.first << ":" << p.second; cout << "\n"; }
};

int main() {
    LFUCache c(2);
    c.put(1, 1); c.put(2, 2);
    cout << "get 1 -> " << c.get(1) << "\n";
    c.put(3, 3);
    int a = c.get(2), b = c.get(3);
    cout << "get 2 -> " << a << " | get 3 -> " << b << "\n";
    c.put(4, 4);
    a = c.get(1); b = c.get(3);
    int d = c.get(4);
    cout << "get 1 -> " << a << " | get 3 -> " << b << " | get 4 -> " << d << "\n";
    c.showFreq();
}
