#include <iostream>
#include <map>
#include <numeric>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

vector<int> parent(10);

int find(int x) {
    while (parent[x] != x) { parent[x] = parent[parent[x]]; x = parent[x]; }  // 路徑壓縮
    return x;
}

int main() {
    int n = 10;  // A..J，J 是孤立點
    iota(parent.begin(), parent.end(), 0);
    istringstream in("AB BC CA DE FG GH HF FI");
    string e;
    // 用並查集合併每條邊的兩端，最後同一個根的點屬於同一個連通分量
    while (in >> e) parent[find(e[0] - 'A')] = find(e[1] - 'A');
    vector<int> roots;
    map<int, vector<int>> groups;
    for (int v = 0; v < n; v++) {
        int r = find(v);
        if (!groups.count(r)) roots.push_back(r);
        groups[r].push_back(v);
    }
    cout << "components: " << roots.size() << "\n";
    for (int r : roots) {
        cout << " ";
        for (int v : groups[r]) cout << " " << char('A' + v);
        cout << "\n";
    }
}
