import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;

public class Huffman {
    record Node(int freq, char ch, Node left, Node right) {}

    static Map<Character, String> codes = new TreeMap<>();

    static void walk(Node n, String code) {
        if (n.left == null) { codes.put(n.ch, code.isEmpty() ? "0" : code); return; }
        walk(n.left, code + "0");
        walk(n.right, code + "1");
    }

    // 每次取出頻率最小的兩棵樹合併（同頻率時保持先後順序），頻率高的字元自然離根較近、編碼較短
    public static void main(String[] args) {
        String text = "ABRACADABRA BANANA";
        Map<Character, Integer> freq = new LinkedHashMap<>();
        for (char c : text.toCharArray()) freq.merge(c, 1, Integer::sum);
        List<Node> pq = new ArrayList<>();
        freq.forEach((c, f) -> pq.add(new Node(f, c, null, null)));
        while (pq.size() > 1) {
            pq.sort(Comparator.comparingInt(Node::freq)); // List.sort 是穩定排序
            Node a = pq.remove(0), b = pq.remove(0);
            pq.add(new Node(a.freq + b.freq, '\0', a, b));
        }
        walk(pq.get(0), "");
        int bits = 0;
        for (Map.Entry<Character, String> e : codes.entrySet()) {
            char c = e.getKey();
            System.out.println((c == ' ' ? "SP" : String.valueOf(c)) + " freq=" + freq.get(c) + " code=" + e.getValue());
            bits += freq.get(c) * e.getValue().length();
        }
        System.out.println("total bits = " + bits + " (fixed 8-bit: " + 8 * text.length() + ")");
    }
}
