#include <algorithm>
#include <cstdio>
#include <string>
#include <vector>
using namespace std;

// 依原字串順序處理後綴；相鄰後綴的 LCP 最多只會比前一個少 1，因此總共只需 O(n) 次比較
vector<int> kasai(const string& s, const vector<int>& sa) {
    int n = (int)s.size();
    vector<int> rnk(n), lcp(n, 0);  // lcp[i] = sa[i] 與 sa[i-1] 的最長共同前綴
    for (int i = 0; i < n; i++) rnk[sa[i]] = i;
    for (int i = 0, k = 0; i < n; i++) {
        if (rnk[i] == 0) { k = 0; continue; }
        int j = sa[rnk[i] - 1];
        while (i + k < n && j + k < n && s[i + k] == s[j + k]) k++;
        lcp[rnk[i]] = k;
        if (k) k--;
    }
    return lcp;
}

int main() {
    string s = "banana$";
    int n = (int)s.size();
    vector<int> sa(n);
    for (int i = 0; i < n; i++) sa[i] = i;
    sort(sa.begin(), sa.end(), [&](int a, int b) { return s.substr(a) < s.substr(b); });  // 直接排序後綴取得後綴陣列
    vector<int> lcp = kasai(s, sa);
    printf(" i  SA LCP suffix\n");
    for (int i = 0; i < n; i++) printf("%2d %3d %3d %s\n", i, sa[i], lcp[i], s.substr(sa[i]).c_str());
}
