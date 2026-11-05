#include <iostream>
#include <stack>
#include <vector>
using namespace std;

// 單調遞增堆疊：柱子被彈出時，它的左右邊界就確定了，可算出以它為高的最大矩形
int main() {
    vector<int> h = {2, 1, 5, 6, 2, 3, 4, 1, 3};
    int n = (int)h.size(), best = 0, bl = 0, br = 0;
    stack<int> st;
    for (int i = 0; i <= n; i++) {
        int cur = i < n ? h[i] : 0;  // 最後補一根高度 0 的柱子把堆疊清空
        while (!st.empty() && h[st.top()] >= cur) {
            int height = h[st.top()];
            st.pop();
            int left = st.empty() ? 0 : st.top() + 1;
            int area = height * (i - left);
            if (area > best) { best = area; bl = left; br = i - 1; }
        }
        st.push(i);
    }
    cout << "max area = " << best << ", bars [" << bl << ", " << br << "]\n";
}
