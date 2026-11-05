#include <iostream>
#include <stack>
#include <vector>
using namespace std;

// 單調遞減堆疊：新元素比堆疊頂端大時，頂端的「下一個較大元素」就是它
vector<int> nextGreater(const vector<int>& a) {
    vector<int> res(a.size(), -1);
    stack<int> st;  // 存索引
    for (int i = 0; i < (int)a.size(); i++) {
        while (!st.empty() && a[st.top()] < a[i]) { res[st.top()] = a[i]; st.pop(); }
        st.push(i);
    }
    return res;
}

int main() {
    vector<int> r = nextGreater({4, 5, 2, 10, 8, 3, 7, 1, 9, 6});
    for (size_t i = 0; i < r.size(); i++) cout << r[i] << (i + 1 < r.size() ? ' ' : '\n');
}
