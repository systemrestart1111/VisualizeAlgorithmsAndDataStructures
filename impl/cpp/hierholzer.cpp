#include <iostream>
#include <sstream>
#include <string>
#include <utility>
#include <vector>
using namespace std;

int main() {
    istringstream in("AB BC CA CD DE EC BD AD");
    vector<vector<pair<int, int>>> adj(26);  // adj[u] = {(鄰居, 邊編號)}
    string e;
    int n = 0, m = 0;
    while (in >> e) {
        int a = e[0] - 'A', b = e[1] - 'A';
        adj[a].push_back({b, m});
        adj[b].push_back({a, m++});
        n = max(n, max(a, b) + 1);
    }
    vector<int> odd;
    for (int v = 0; v < n; v++) if (adj[v].size() % 2) odd.push_back(v);
    int start = odd.empty() ? 0 : odd[0];  // 有兩個奇點時必須從奇點出發
    vector<bool> used(m);
    vector<size_t> ptr(n, 0);
    // 沿著未用過的邊一直走，走不動時把該點加入路徑並回退；最後路徑反轉即為歐拉路徑
    vector<int> st = {start}, path;
    while (!st.empty()) {
        int u = st.back();
        while (ptr[u] < adj[u].size() && used[adj[u][ptr[u]].second]) ptr[u]++;
        if (ptr[u] == adj[u].size()) { path.push_back(u); st.pop_back(); }
        else {
            used[adj[u][ptr[u]].second] = true;
            st.push_back(adj[u][ptr[u]].first);
        }
    }
    cout << "odd vertices:";
    for (int v : odd) cout << " " << char('A' + v);
    cout << "\neuler path:";
    for (int i = (int)path.size() - 1; i >= 0; i--) cout << (i + 1 == (int)path.size() ? " " : " -> ") << char('A' + path[i]);
    cout << "\n";
}
