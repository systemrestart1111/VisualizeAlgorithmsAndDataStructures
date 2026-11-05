#include <algorithm>
#include <iostream>
#include <map>
#include <string>
#include <tuple>
#include <vector>
using namespace std;

int main() {
    string text = "abracadabra alakazam";
    map<char, int> freq, lens;
    for (char c : text) freq[c]++;
    vector<char> syms;
    for (auto &kv : freq) syms.push_back(kv.first);
    // Huffman 只決定碼長；平手時依建立順序（葉子依符號排序在前）
    vector<tuple<int, int, string>> nodes;
    for (size_t i = 0; i < syms.size(); i++) nodes.emplace_back(freq[syms[i]], i, string(1, syms[i]));
    int order = syms.size();
    if (syms.size() == 1) lens[syms[0]] = 1;
    while (nodes.size() > 1) {
        sort(nodes.begin(), nodes.end(), [](const tuple<int, int, string> &a, const tuple<int, int, string> &b) { return make_pair(get<0>(a), get<1>(a)) < make_pair(get<0>(b), get<1>(b)); });
        string leaves = get<2>(nodes[0]) + get<2>(nodes[1]);
        for (char c : leaves) lens[c]++;
        int w = get<0>(nodes[0]) + get<0>(nodes[1]);
        nodes.erase(nodes.begin(), nodes.begin() + 2);
        nodes.insert(nodes.begin(), make_tuple(w, order++, leaves));
    }
    // 依（碼長, 符號）排序；每個碼是前一個加 1，碼長變長時左移補 0
    sort(syms.begin(), syms.end(), [&](char a, char b) { return make_pair(lens[a], a) < make_pair(lens[b], b); });
    map<char, string> codes;
    int code = 0, prev = lens[syms[0]];
    for (char c : syms) {
        code <<= lens[c] - prev;
        prev = lens[c];
        string s;
        for (int b = lens[c] - 1; b >= 0; b--) s += (code >> b & 1) ? '1' : '0';
        codes[c] = s;
        code++;
        cout << "'" << c << "' len " << lens[c] << " code " << s << "\n";
    }
    string enc, dec, buf;
    for (char c : text) enc += codes[c];
    map<string, char> rev;
    for (auto &kv : codes) rev[kv.second] = kv.first;
    for (char b : enc) { buf += b; if (rev.count(buf)) { dec += rev[buf]; buf.clear(); } }
    cout << "bits " << enc.size() << ", decoded ok " << (dec == text ? "True" : "False") << "\n";
}
