#include <cstdio>
#include <vector>
using namespace std;

const int INF = 1e9;

int main() {
    const int n = 5;
    int edges[][3] = {{0, 1, 3}, {0, 2, 8}, {0, 4, -4}, {1, 3, 1}, {1, 4, 7}, {2, 1, 4}, {3, 0, 2}, {3, 2, -5}, {4, 3, 6}};
    vector<vector<int>> d(n, vector<int>(n, INF));
    for (int i = 0; i < n; i++) d[i][i] = 0;
    for (auto& e : edges) d[e[0]][e[1]] = e[2];
    // 依序允許經過中繼點 k：d[i][j] = min(d[i][j], d[i][k] + d[k][j])
    for (int k = 0; k < n; k++)
        for (int i = 0; i < n; i++)
            for (int j = 0; j < n; j++)
                if (d[i][k] < INF && d[k][j] < INF && d[i][k] + d[k][j] < d[i][j]) d[i][j] = d[i][k] + d[k][j];
    printf("   ");
    for (int j = 0; j < n; j++) printf("%4c", 'A' + j);
    printf("\n");
    for (int i = 0; i < n; i++) {
        printf("%3c", 'A' + i);
        for (int j = 0; j < n; j++) {
            if (d[i][j] >= INF) printf("%4s", "inf");
            else printf("%4d", d[i][j]);
        }
        printf("\n");
    }
}
