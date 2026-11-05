#include <cstdio>
#include <string>
#include <vector>
using namespace std;

// 後進先出（LIFO）：只在頂端 push / pop，都是 O(1)
class Stack {
    vector<int> items;

public:
    void push(int v) { items.push_back(v); }
    int pop() { int v = items.back(); items.pop_back(); return v; }
    int peek() const { return items.back(); }
    string str() const {
        string s = "bottom [";
        for (size_t i = 0; i < items.size(); i++) s += (i ? " " : "") + to_string(items[i]);
        return s + "] top";
    }
};

int main() {
    Stack s;
    for (int v : {4, 8, 15}) { s.push(v); printf("push %2d: %s\n", v, s.str().c_str()); }
    printf("peek -> %d\n", s.peek());
    for (int i = 0; i < 2; i++) { int v = s.pop(); printf("pop -> %d: %s\n", v, s.str().c_str()); }
    s.push(16); printf("push 16: %s\n", s.str().c_str());
}
