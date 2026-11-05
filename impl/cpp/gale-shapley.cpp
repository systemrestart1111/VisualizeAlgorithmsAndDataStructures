#include <iostream>
#include <map>
#include <queue>
#include <string>
using namespace std;

int main() {
    map<char, string> men = {{'A', "XYZW"}, {'B', "YXWZ"}, {'C', "XZYW"}, {'D', "ZWXY"}};    // 求婚方的偏好（由高到低）
    map<char, string> women = {{'X', "BADC"}, {'Y', "ACBD"}, {'Z', "CDAB"}, {'W', "DBCA"}};  // 被求婚方的偏好
    map<char, map<char, int>> rank;
    for (auto& w : women)
        for (int i = 0; i < (int)w.second.size(); i++) rank[w.first][w.second[i]] = i;
    // 自由的求婚者依序向下一個還沒求過的對象求婚；對方若更喜歡他就換掉現任
    queue<char> freeMen;
    for (auto& m : men) freeMen.push(m.first);
    map<char, int> nxt;
    map<char, char> partner;  // 被求婚方 -> 求婚方
    while (!freeMen.empty()) {
        char m = freeMen.front();
        freeMen.pop();
        char w = men[m][nxt[m]++];
        if (!partner.count(w)) {
            partner[w] = m;
            cout << m << " proposes " << w << ": accepted\n";
        } else if (rank[w][m] < rank[w][partner[w]]) {
            cout << m << " proposes " << w << ": accepted, " << partner[w] << " is free again\n";
            freeMen.push(partner[w]);
            partner[w] = m;
        } else {
            cout << m << " proposes " << w << ": rejected\n";
            freeMen.push(m);
        }
    }
    cout << "stable matching:";
    for (auto& m : men)
        for (auto& p : partner) if (p.second == m.first) cout << " " << m.first << "-" << p.first;
    cout << "\n";
}
