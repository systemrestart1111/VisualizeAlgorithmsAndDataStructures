#include <iostream>
#include <vector>
using namespace std;

// p[i] = a[0] + … + a[i-1]；區間和 a[l..r] = p[r+1] - p[l]，查詢 O(1)
vector<long long> buildPrefix(const vector<int>& a) {
    vector<long long> p(a.size() + 1, 0);
    for (size_t i = 0; i < a.size(); i++) p[i + 1] = p[i] + a[i];
    return p;
}

int main() {
    vector<int> a = {3, 1, 4, 1, 5, 9, 2, 6, 5, 3};
    vector<long long> p = buildPrefix(a);
    cout << "prefix:";
    for (long long x : p) cout << " " << x;
    cout << "\nsum[2..6] = " << p[7] - p[2] << "\n";
}
