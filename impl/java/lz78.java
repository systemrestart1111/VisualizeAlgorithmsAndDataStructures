import java.util.LinkedHashMap;
import java.util.Map;

public class LZ78 {
    // 字典從空開始：找出字典中最長的前綴 w，輸出 (w 的編號, 下一個字元)，並把 w+字元 加入字典
    public static void main(String[] args) {
        String s = "ABBCBCABABCAABCAAB", w = "";
        Map<String, Integer> dict = new LinkedHashMap<>();
        StringBuilder out = new StringBuilder("output:");
        for (char ch : s.toCharArray()) {
            if (dict.containsKey(w + ch)) { w += ch; continue; }
            out.append(" (").append(w.isEmpty() ? 0 : dict.get(w)).append(',').append(ch).append(')');
            dict.put(w + ch, dict.size() + 1);
            w = "";
        }
        if (!w.isEmpty()) out.append(" (").append(dict.get(w)).append(",)");
        StringBuilder d = new StringBuilder("dictionary:");
        dict.forEach((k, v) -> d.append(' ').append(v).append(':').append(k));
        System.out.println(out + "\n" + d);
    }
}
