#include <iostream>
#include <stack>
#include <string>
using namespace std;

// 遇到左括號就推入堆疊；遇到右括號時，堆疊頂端必須是對應的左括號
bool isBalanced(const string& s) {
    stack<char> st;
    for (char c : s) {
        if (c == '(' || c == '[' || c == '{') st.push(c);
        else if (c == ')' || c == ']' || c == '}') {
            char want = c == ')' ? '(' : c == ']' ? '[' : '{';
            if (st.empty() || st.top() != want) return false;
            st.pop();
        }
    }
    return st.empty();
}

int main() {
    for (string s : {"{[()()]}([]{})", "{[(])}", "(("}) cout << s << " -> " << (isBalanced(s) ? "True" : "False") << "\n";
}
