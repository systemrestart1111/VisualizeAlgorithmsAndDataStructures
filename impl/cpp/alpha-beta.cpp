#include <algorithm>
#include <climits>
#include <iostream>
#include <vector>
using namespace std;

vector<int> leaves = {3, 5, 6, 9, 1, 2, 0, -1, 8, 4, 7, 2, 5, 1, 3, 6}, visited;
const int B = 2, DEPTH = 4;

// α：MAX 已保證的下界，β：MIN 已保證的上界；一旦 α >= β，剩下的兄弟節點不可能影響結果，直接剪掉
int ab(int depth, int index, int alpha, int beta, bool isMax) {
    if (depth == DEPTH) { visited.push_back(index); return leaves[index]; }
    int best = isMax ? INT_MIN : INT_MAX;
    for (int k = 0; k < B; k++) {
        int v = ab(depth + 1, index * B + k, alpha, beta, !isMax);
        if (isMax) { best = max(best, v); alpha = max(alpha, v); }
        else { best = min(best, v); beta = min(beta, v); }
        if (alpha >= beta) break;
    }
    return best;
}

int main() {
    int root = ab(0, 0, INT_MIN, INT_MAX, true);
    cout << "root value = " << root << "\nleaves evaluated:";
    for (int i : visited) cout << " " << i;
    cout << "\npruned " << leaves.size() - visited.size() << " of " << leaves.size() << " leaves\n";
}
