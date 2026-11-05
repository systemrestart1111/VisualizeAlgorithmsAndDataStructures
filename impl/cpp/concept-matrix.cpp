#include <iostream>
#include <string>
#include <vector>
using namespace std;
using M = vector<vector<int>>;

M matmul(const M &A, const M &B) {
    M C(A.size(), vector<int>(B[0].size()));
    for (size_t i = 0; i < A.size(); i++)
        for (size_t j = 0; j < B[0].size(); j++)
            for (size_t k = 0; k < B.size(); k++) C[i][j] += A[i][k] * B[k][j];
    return C;
}
M transpose(const M &A) {
    M T(A[0].size(), vector<int>(A.size()));
    for (size_t i = 0; i < A.size(); i++) for (size_t j = 0; j < A[0].size(); j++) T[j][i] = A[i][j];
    return T;
}
int det(const M &A) {
    if (A.size() == 1) return A[0][0];
    int s = 0;
    for (size_t j = 0; j < A.size(); j++) {
        M sub;
        for (size_t r = 1; r < A.size(); r++) {
            vector<int> row;
            for (size_t k = 0; k < A.size(); k++) if (k != j) row.push_back(A[r][k]);
            sub.push_back(row);
        }
        s += (j % 2 ? -1 : 1) * A[0][j] * det(sub);
    }
    return s;
}
string str(const M &A) {
    string s = "[";
    for (size_t i = 0; i < A.size(); i++) {
        s += i ? ", [" : "[";
        for (size_t j = 0; j < A[i].size(); j++) s += (j ? ", " : "") + to_string(A[i][j]);
        s += "]";
    }
    return s + "]";
}

int main() {
    M A = {{1, 2}, {3, 4}}, B = {{5, 6}, {7, 8}};
    cout << "AB = " << str(matmul(A, B)) << "\n";
    cout << "BA = " << str(matmul(B, A)) << "\n";
    cout << "A^T = " << str(transpose(A)) << "\n";
    cout << "det(A) = " << det(A) << "\n";
    cout << "det([[2,0,1],[1,3,2],[1,1,1]]) = " << det({{2, 0, 1}, {1, 3, 2}, {1, 1, 1}}) << "\n";
}
