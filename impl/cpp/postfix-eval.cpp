#include <iostream>
#include <sstream>
#include <stack>
#include <string>
using namespace std;

// 數字推入堆疊；遇到運算子就彈出兩個數計算，結果再推回去
long long evalPostfix(const string& expr) {
    stack<long long> st;
    istringstream in(expr);
    string tok;
    while (in >> tok) {
        if (tok == "+" || tok == "-" || tok == "*" || tok == "/") {
            long long b = st.top(); st.pop();
            long long a = st.top(); st.pop();
            st.push(tok == "+" ? a + b : tok == "-" ? a - b : tok == "*" ? a * b : a / b);
        } else st.push(stoll(tok));
    }
    return st.top();
}

int main() { cout << evalPostfix("5 1 2 + 4 * + 3 -") << "\n"; }
