#include <iostream>
#include <vector>
using namespace std;

// 每個元素直接寫到最終位置；跳過重複值避免無窮迴圈。回傳寫入次數
int cycleSort(vector<int> &a) {
    int writes = 0, n = a.size();
    auto posOf = [&](int start, int item) { int p = start; for (int i = start + 1; i < n; i++) if (a[i] < item) p++; return p; };
    for (int start = 0; start < n - 1; start++) {
        int item = a[start], pos = posOf(start, item);
        if (pos == start) continue;
        while (item == a[pos]) pos++;
        swap(item, a[pos]); writes++;
        while (pos != start) {
            pos = posOf(start, item);
            while (pos != start && item == a[pos]) pos++;
            if (pos == start) { a[start] = item; writes++; break; }
            swap(item, a[pos]); writes++;
        }
    }
    return writes;
}
void show(const vector<int> &a) { for (int x : a) cout << " " << x; }

int main() {
    vector<int> a = {20, 40, 50, 10, 30, 40, 20, 60, 10}, b = {3, 3, 3, 1};
    int w = cycleSort(a);
    cout << "sorted:"; show(a); cout << "\nwrites: " << w << "\n";
    cout << "dups:"; show(b); cout << " ->";
    cycleSort(b);
    show(b); cout << "\n";
}
