#include <cstdio>
#include <utility>
#include <vector>
using namespace std;

typedef pair<long long, long long> P;

// (A - O) × (B - O)：> 0 表示 B 在 OA 左側（逆時針），< 0 在右側，= 0 共線
long long cross(P o, P a, P b) { return (a.first - o.first) * (b.second - o.second) - (a.second - o.second) * (b.first - o.first); }

int main() {
    P O = {2, 2}, A = {8, 4};
    for (P B : vector<P>{{4, 8}, {9, 1}, {5, 3}, {11, 5}}) {
        long long c = cross(O, A, B);
        printf("B=%lld,%lld: cross = %4lld -> %s\n", B.first, B.second, c, c > 0 ? "left (counter-clockwise)" : c < 0 ? "right (clockwise)" : "collinear");
    }
}
