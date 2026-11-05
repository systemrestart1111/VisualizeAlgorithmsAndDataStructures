#include <cctype>
#include <iostream>
#include <stack>
#include <string>
using namespace std;

int prec(char c) { return c == '^' ? 3 : (c == '*' || c == '/') ? 2 : 1; }

// 運算元直接輸出；運算子進堆疊前，先彈出優先權較高（或相同且左結合）的運算子
string toPostfix(const string& expr) {
    string out;
    stack<char> st;
    auto emit = [&](char c) { if (!out.empty()) out += ' '; out += c; };
    for (char c : expr) {
        if (c == ' ') continue;
        if (isalnum((unsigned char)c)) emit(c);
        else if (c == '(') st.push(c);
        else if (c == ')') {
            while (st.top() != '(') { emit(st.top()); st.pop(); }
            st.pop();
        } else {
            while (!st.empty() && st.top() != '(' && (prec(st.top()) > prec(c) || (prec(st.top()) == prec(c) && c != '^'))) {
                emit(st.top());
                st.pop();
            }
            st.push(c);
        }
    }
    while (!st.empty()) { emit(st.top()); st.pop(); }
    return out;
}

int main() { cout << toPostfix("A + B * (C - D) / E ^ F ^ G") << "\n"; }
