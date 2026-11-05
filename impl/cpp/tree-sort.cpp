#include <iostream>
#include <memory>
#include <vector>
using namespace std;

struct Node {
    int key;
    unique_ptr<Node> left, right;
    explicit Node(int k) : key(k) {}
};

// 插入二元搜尋樹：小於往左、其餘往右
void insert(unique_ptr<Node>& root, int key) {
    if (!root) root.reset(new Node(key));
    else if (key < root->key) insert(root->left, key);
    else insert(root->right, key);
}

// 中序走訪 BST 會得到遞增序列
void inorder(const unique_ptr<Node>& root, vector<int>& out) {
    if (!root) return;
    inorder(root->left, out);
    out.push_back(root->key);
    inorder(root->right, out);
}

int main() {
    vector<int> a = {50, 30, 70, 20, 40, 60, 80, 35, 65, 10, 45}, out;
    unique_ptr<Node> root;
    for (int x : a) insert(root, x);
    inorder(root, out);
    for (size_t i = 0; i < out.size(); i++) cout << out[i] << (i + 1 < out.size() ? ' ' : '\n');
}
