#include <iostream>
#include <vector>
using namespace std;

long long gcd(long long a, long long b) { return b ? gcd(b, a % b) : a; }

// lcm(a, b) = a / gcd(a, b) * b；多個數就依序兩兩求（先除後乘，避免溢位）
int main() {
    vector<long long> nums = {12, 18, 30, 8};
    long long cur = nums[0];
    for (size_t i = 1; i < nums.size(); i++) {
        long long g = gcd(cur, nums[i]), nxt = cur / g * nums[i];
        cout << "lcm(" << cur << ", " << nums[i] << ") = " << cur << " / " << g << " x " << nums[i] << " = " << nxt << "\n";
        cur = nxt;
    }
    cout << "lcm = " << cur << "\n";
}
