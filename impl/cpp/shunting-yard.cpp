#include <cctype>
#include <cmath>
#include <cstdio>
#include <iostream>
#include <map>
#include <string>
#include <vector>
using namespace std;

// 調度場演算法：支援函式、逗號參數與一元負號，輸出後序（RPN）再求值
struct Tok {
    bool isNum;
    double num;
    string op;
};

const map<string, double> PREC = {{"+", 1}, {"-", 1}, {"*", 2}, {"/", 2}, {"neg", 2.5}, {"^", 3}};
bool isFunc(const string& o) { return o == "max" || o == "min" || o == "sqrt" || o == "abs"; }

string fmt(double x) {
    char buf[32];
    if (x == floor(x)) snprintf(buf, sizeof buf, "%lld", (long long)x);
    else snprintf(buf, sizeof buf, "%.4f", x);
    return buf;
}

vector<Tok> toRpn(const string& s) {
    vector<Tok> out;
    vector<string> ops;
    bool prevValue = false;  // 前一個 token 是否為數值或右括號
    for (size_t i = 0; i < s.size();) {
        char c = s[i];
        if (c == ' ') { i++; continue; }
        if (isdigit((unsigned char)c)) {
            size_t len;
            out.push_back({true, stod(s.substr(i), &len), ""});
            i += len;
            prevValue = true;
        } else if (isalpha((unsigned char)c)) {
            string name;
            while (i < s.size() && isalpha((unsigned char)s[i])) name += s[i++];
            ops.push_back(name);
            prevValue = false;
        } else {
            i++;
            if (c == '(') { ops.push_back("("); prevValue = false; }
            else if (c == ',' || c == ')') {
                while (ops.back() != "(") { out.push_back({false, 0, ops.back()}); ops.pop_back(); }
                if (c == ')') {
                    ops.pop_back();
                    if (!ops.empty() && isFunc(ops.back())) { out.push_back({false, 0, ops.back()}); ops.pop_back(); }
                    prevValue = true;
                } else prevValue = false;
            } else {
                string t(1, c);
                if (c == '-' && !prevValue) t = "neg";  // 一元負號
                else
                    while (!ops.empty() && PREC.count(ops.back()) &&
                           (PREC.at(ops.back()) > PREC.at(t) || (PREC.at(ops.back()) == PREC.at(t) && t != "^"))) {
                        out.push_back({false, 0, ops.back()});
                        ops.pop_back();
                    }
                ops.push_back(t);
                prevValue = false;
            }
        }
    }
    while (!ops.empty()) { out.push_back({false, 0, ops.back()}); ops.pop_back(); }
    return out;
}

double evalRpn(const vector<Tok>& rpn) {
    vector<double> st;
    for (const Tok& t : rpn) {
        if (t.isNum) { st.push_back(t.num); continue; }
        const string& o = t.op;
        if (o == "neg") st.back() = -st.back();
        else if (o == "sqrt") st.back() = sqrt(st.back());
        else if (o == "abs") st.back() = fabs(st.back());
        else {
            double b = st.back(); st.pop_back();
            double a = st.back(); st.pop_back();
            double r = o == "max" ? max(a, b) : o == "min" ? min(a, b) : o == "+" ? a + b : o == "-" ? a - b
                     : o == "*" ? a * b : o == "/" ? a / b : pow(a, b);
            st.push_back(r);
        }
    }
    return st[0];
}

int main() {
    vector<Tok> rpn = toRpn("3 + max(4, 2 * 5) * -2 ^ 2 - sqrt(16)");
    cout << "RPN:";
    for (const Tok& t : rpn) cout << " " << (t.isNum ? fmt(t.num) : t.op);
    cout << "\nvalue = " << fmt(evalRpn(rpn)) << "\n";
}
