import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

public class LZW {
    // 字典預先放入所有單一字元（0..255）；持續延長 w，遇到不在字典裡的 w+c 就輸出 w 的編號並把 w+c 加入字典
    public static void main(String[] args) {
        String s = "TOBEORNOTTOBEORTOBEORNOT", w = "";
        Map<String, Integer> dict = new HashMap<>();
        List<String> added = new ArrayList<>();
        for (int i = 0; i < 256; i++) dict.put(String.valueOf((char) i), i);
        List<Integer> codes = new ArrayList<>();
        for (char ch : s.toCharArray()) {
            if (dict.containsKey(w + ch)) { w += ch; continue; }
            codes.add(dict.get(w));
            dict.put(w + ch, 256 + added.size());
            added.add(w + ch);
            w = String.valueOf(ch);
        }
        if (!w.isEmpty()) codes.add(dict.get(w));
        StringBuilder a = new StringBuilder("codes:"), b = new StringBuilder("new entries:");
        for (int c : codes) a.append(' ').append(c);
        for (int i = 0; i < added.size(); i++) b.append(' ').append(256 + i).append(':').append(added.get(i));
        // 解碼：特殊情況是編號剛好是正要建立的那一個
        List<String> inv = new ArrayList<>();
        for (int i = 0; i < 256; i++) inv.add(String.valueOf((char) i));
        String prev = inv.get(codes.get(0));
        StringBuilder out = new StringBuilder(prev);
        for (int i = 1; i < codes.size(); i++) {
            String entry = codes.get(i) < inv.size() ? inv.get(codes.get(i)) : prev + prev.charAt(0);
            out.append(entry);
            inv.add(prev + entry.charAt(0));
            prev = entry;
        }
        System.out.println(a + "\n" + b);
        System.out.println(s.length() + " chars -> " + codes.size() + " codes, decode ok: " + (out.toString().equals(s) ? "True" : "False"));
    }
}
