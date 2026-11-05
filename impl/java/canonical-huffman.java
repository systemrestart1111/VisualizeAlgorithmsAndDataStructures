import java.util.*;

public class CanonicalHuffman {
    public static void main(String[] args) {
        String text = "abracadabra alakazam";
        TreeMap<Character, Integer> freq = new TreeMap<>();
        for (char c : text.toCharArray()) freq.merge(c, 1, Integer::sum);
        List<Character> syms = new ArrayList<>(freq.keySet());
        Map<Character, Integer> lens = new HashMap<>();
        for (char c : syms) lens.put(c, 0);
        // Huffman 只決定碼長；平手時依建立順序（葉子依符號排序在前）
        List<Object[]> nodes = new ArrayList<>(); // {權重, 順序, 葉子字串}
        for (int i = 0; i < syms.size(); i++) nodes.add(new Object[]{freq.get(syms.get(i)), i, String.valueOf(syms.get(i))});
        int order = syms.size();
        if (syms.size() == 1) lens.put(syms.get(0), 1);
        while (nodes.size() > 1) {
            nodes.sort(Comparator.comparingInt((Object[] x) -> (Integer) x[0]).thenComparingInt(x -> (Integer) x[1]));
            String leaves = (String) nodes.get(0)[2] + nodes.get(1)[2];
            for (char c : leaves.toCharArray()) lens.merge(c, 1, Integer::sum);
            int w = (Integer) nodes.get(0)[0] + (Integer) nodes.get(1)[0];
            nodes.remove(0); nodes.remove(0);
            nodes.add(0, new Object[]{w, order++, leaves});
        }
        // 依（碼長, 符號）排序；每個碼是前一個加 1，碼長變長時左移補 0
        syms.sort(Comparator.comparingInt((Character c) -> lens.get(c)).thenComparing(c -> c));
        Map<Character, String> codes = new HashMap<>();
        int code = 0, prev = lens.get(syms.get(0));
        for (char c : syms) {
            code <<= lens.get(c) - prev;
            prev = lens.get(c);
            StringBuilder s = new StringBuilder();
            for (int b = lens.get(c) - 1; b >= 0; b--) s.append((code >> b & 1) == 1 ? '1' : '0');
            codes.put(c, s.toString());
            code++;
            System.out.println("'" + c + "' len " + lens.get(c) + " code " + s);
        }
        StringBuilder enc = new StringBuilder(), dec = new StringBuilder(), buf = new StringBuilder();
        for (char c : text.toCharArray()) enc.append(codes.get(c));
        Map<String, Character> rev = new HashMap<>();
        codes.forEach((k, v) -> rev.put(v, k));
        for (char b : enc.toString().toCharArray()) { buf.append(b); if (rev.containsKey(buf.toString())) { dec.append(rev.get(buf.toString())); buf.setLength(0); } }
        System.out.println("bits " + enc.length() + ", decoded ok " + (dec.toString().equals(text) ? "True" : "False"));
    }
}
