#include <algorithm>
#include <cstdio>
#include <map>
#include <string>
#include <vector>
using namespace std;

struct Task { char name; int d; string deps; };

int main() {
    vector<Task> tasks = {{'A', 3, ""}, {'B', 2, "A"}, {'C', 4, "A"}, {'D', 2, "B"}, {'E', 2, "C"}, {'F', 3, "DE"}, {'G', 4, ""}, {'H', 1, "G"}};
    map<char, int> ES, EF, LS, LF;
    int T = 0;
    // 正向算 ES/EF（工作依前置先後列出）
    for (auto &t : tasks) {
        ES[t.name] = 0;
        for (char p : t.deps) ES[t.name] = max(ES[t.name], EF[p]);
        EF[t.name] = ES[t.name] + t.d;
        T = max(T, EF[t.name]);
    }
    // 反向算 LS/LF；浮時 0 為關鍵工作
    for (int i = tasks.size() - 1; i >= 0; i--) {
        char n = tasks[i].name;
        LF[n] = T;
        for (auto &t : tasks) if (t.deps.find(n) != string::npos) LF[n] = min(LF[n], LS[t.name]);
        LS[n] = LF[n] - tasks[i].d;
    }
    printf("project duration: %d\ntask dur ES EF LS LF slack\n", T);
    for (auto &t : tasks) printf("%4c %3d %2d %2d %2d %2d %5d\n", t.name, t.d, ES[t.name], EF[t.name], LS[t.name], LF[t.name], LS[t.name] - ES[t.name]);
    printf("critical:");
    for (auto &t : tasks) if (LS[t.name] == ES[t.name]) printf(" %c", t.name);
    printf("\n");
}
