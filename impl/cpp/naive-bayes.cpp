#include <cmath>
#include <cstdio>
#include <map>
#include <set>
#include <sstream>
#include <string>
#include <vector>
using namespace std;

vector<pair<string, string>> TRAIN = {{"spam", "free money now"}, {"spam", "win free prize now"}, {"spam", "claim your free money"}, {"spam", "cheap prize offer"},
                                      {"ham", "meeting at noon"}, {"ham", "project meeting notes"}, {"ham", "lunch at noon tomorrow"}, {"ham", "your project report"}};
vector<string> split(const string &s) { istringstream in(s); vector<string> out; string w; while (in >> w) out.push_back(w); return out; }

// score[c] = log P(c) + Σ log((count + α) / (total + α|V|))；α = 0 時未見過的字得到 −∞
double score(const string &c, const string &msg, double alpha) {
    set<string> vocab;
    map<string, int> count;
    int total = 0, docs = 0;
    for (auto &d : TRAIN)
        for (auto &w : split(d.second)) { vocab.insert(w); if (d.first == c) { count[w]++; total++; } }
    for (auto &d : TRAIN) docs += d.first == c;
    double s = log((double)docs / TRAIN.size());
    for (auto &w : split(msg)) {
        double num = (count.count(w) ? count[w] : 0) + alpha;
        if (num == 0) return -INFINITY;
        s += log(num / (total + alpha * vocab.size()));
    }
    return s;
}
string fmt(double v) { if (std::isinf(v)) return "-inf"; char b[32]; snprintf(b, sizeof b, "%.3f", v); return b; }

int main() {
    for (string msg : {"free lunch meeting", "win cheap money", "project notes tomorrow", "free coffee now"})
        for (int alpha : {1, 0}) {
            double sp = score("spam", msg, alpha), hm = score("ham", msg, alpha);
            string pred = std::isinf(sp) && std::isinf(hm) ? "undecidable" : sp >= hm ? "spam" : "ham";
            printf("'%s', alpha %d: spam %s, ham %s -> %s\n", msg.c_str(), alpha, fmt(sp).c_str(), fmt(hm).c_str(), pred.c_str());
        }
}
