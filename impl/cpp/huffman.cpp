#include <algorithm>
#include <iostream>
#include <map>
#include <memory>
#include <string>
#include <vector>
using namespace std;

struct Node {
    int freq;
    char ch;
    shared_ptr<Node> left, right;
};

map<char, string> codes;
void walk(const shared_ptr<Node>& n, const string& code) {
    if (!n->left) { codes[n->ch] = code.empty() ? "0" : code; return; }
    walk(n->left, code + "0");
    walk(n->right, code + "1");
}

// 每次取出頻率最小的兩棵樹合併（同頻率時保持先後順序），頻率高的字元自然離根較近、編碼較短
int main() {
    string text = "ABRACADABRA BANANA";
    map<char, int> freq;
    vector<shared_ptr<Node>> pq;
    for (char c : text) {
        if (!freq.count(c)) pq.push_back(make_shared<Node>(Node{0, c, nullptr, nullptr}));
        freq[c]++;
    }
    for (auto& n : pq) n->freq = freq[n->ch];
    while (pq.size() > 1) {
        stable_sort(pq.begin(), pq.end(), [](const shared_ptr<Node>& a, const shared_ptr<Node>& b) { return a->freq < b->freq; });
        auto a = pq[0], b = pq[1];
        pq.erase(pq.begin(), pq.begin() + 2);
        pq.push_back(make_shared<Node>(Node{a->freq + b->freq, 0, a, b}));
    }
    walk(pq[0], "");
    int bits = 0;
    for (auto& p : codes) {
        cout << (p.first == ' ' ? string("SP") : string(1, p.first)) << " freq=" << freq[p.first] << " code=" << p.second << "\n";
        bits += freq[p.first] * (int)p.second.size();
    }
    cout << "total bits = " << bits << " (fixed 8-bit: " << 8 * text.size() << ")\n";
}
