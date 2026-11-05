#include <iostream>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

vector<vector<int>> adj(26);
vector<int> path;
vector<bool> seen(26);
const int n = 9;

// 從起點延伸路徑，每次只走沒去過的鄰居；走不下去就退回（回溯），長度達到 n 即成功
bool bt() {
    if ((int)path.size() == n) return true;
    for (int v : adj[path.back()]) {
        if (seen[v]) continue;
        path.push_back(v);
        seen[v] = true;
        if (bt()) return true;
        path.pop_back();
        seen[v] = false;
    }
    return false;
}

int main() {
    istringstream in("AB AD BC BE CF DE EF DG EH FI GH HI");
    string e;
    while (in >> e) {
        adj[e[0] - 'A'].push_back(e[1] - 'A');
        adj[e[1] - 'A'].push_back(e[0] - 'A');
    }
    path.push_back(0);
    seen[0] = true;
    cout << "Hamiltonian path:";
    if (!bt()) cout << " none\n";
    else {
        for (size_t i = 0; i < path.size(); i++) cout << (i ? " -> " : " ") << char('A' + path[i]);
        cout << "\n";
    }
}
