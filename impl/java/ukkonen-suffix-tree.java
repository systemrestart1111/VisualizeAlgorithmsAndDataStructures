import java.util.*;

public class UkkonenSuffixTree {
    static class Node {
        int start; int[] end; TreeMap<Character, Node> kids = new TreeMap<>(); Node link;
        Node(int s, int[] e) { start = s; end = e; }
        int len() { return end[0] - start + 1; }
    }

    // Ukkonen：葉子共用全域 end；active point 記住插入位置；新內部節點以 suffix link 串接
    static Node build(String t) {
        int[] leafEnd = {-1};
        Node root = new Node(-1, new int[]{-1});
        root.link = root;
        Node aNode = root;
        int aEdge = 0, aLen = 0, rem = 0;
        for (int i = 0; i < t.length(); i++) {
            leafEnd[0] = i;
            rem++;
            Node lastNew = null;
            while (rem > 0) {
                if (aLen == 0) aEdge = i;
                char ch = t.charAt(aEdge);
                if (!aNode.kids.containsKey(ch)) {
                    aNode.kids.put(ch, new Node(i, leafEnd));
                    if (lastNew != null) { lastNew.link = aNode; lastNew = null; }
                } else {
                    Node nx = aNode.kids.get(ch);
                    if (aLen >= nx.len()) { aEdge += nx.len(); aLen -= nx.len(); aNode = nx; continue; }
                    if (t.charAt(nx.start + aLen) == t.charAt(i)) {
                        if (lastNew != null && aNode != root) { lastNew.link = aNode; lastNew = null; }
                        aLen++;
                        break;
                    }
                    Node split = new Node(nx.start, new int[]{nx.start + aLen - 1});
                    split.link = root;
                    aNode.kids.put(ch, split);
                    split.kids.put(t.charAt(i), new Node(i, leafEnd));
                    nx.start += aLen;
                    split.kids.put(t.charAt(nx.start), nx);
                    if (lastNew != null) lastNew.link = split;
                    lastNew = split;
                }
                rem--;
                if (aNode == root && aLen > 0) { aLen--; aEdge = i - rem + 1; }
                else if (aNode != root) aNode = aNode.link;
            }
        }
        return root;
    }
    // 依邊的首字元字典序 DFS，葉子的出現順序就是後綴陣列
    static void dfs(Node n, int depth, int total, List<Integer> out) {
        if (n.kids.isEmpty()) { out.add(total - depth); return; }
        for (Node k : n.kids.values()) dfs(k, depth + k.len(), total, out);
    }

    public static void main(String[] args) {
        for (String s : new String[]{"banana", "abcabxabcd", "mississippi", "aaaa"}) {
            String t = s + "$";
            List<Integer> sa = new ArrayList<>(), naive = new ArrayList<>();
            dfs(build(t), 0, t.length(), sa);
            for (int i = 0; i < t.length(); i++) naive.add(i);
            naive.sort(Comparator.comparing(t::substring));
            System.out.println(t + ": leaves " + sa.size() + ", suffix array " + sa + ", matches naive " + (sa.equals(naive) ? "True" : "False"));
        }
    }
}
