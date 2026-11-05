#include <iostream>
#include <vector>
using namespace std;

// 數學上的模：C++ 的 % 對負數會得到負餘數，需加 m 修正到 [0, m)
int normMod(int a, int m) { return ((a % m) + m) % m; }

int main() {
    vector<int> nums = {-1, 27, 52, 13, -27};
    int m = 26;
    for (int x : nums) cout << x << " mod " << m << " = " << normMod(x, m) << "\n";
    int a = nums[0], b = nums[1];
    cout << "(" << a << " + " << b << ") mod " << m << " = " << normMod(a + b, m) << " = " << normMod(normMod(a, m) + normMod(b, m), m) << "\n";
    cout << "(" << a << " * " << b << ") mod " << m << " = " << normMod(a * b, m) << " = " << normMod(normMod(a, m) * normMod(b, m), m) << "\n";
    cout << "27 ≡ 1 (mod 26): " << (normMod(27, m) == normMod(1, m) ? "True" : "False") << "\n";
}
