import java.util.*;

public class MsdRadixSort {
    // 依第 d 個字元分桶；在第 d 位已結束的字串放在最前面的結尾桶
    static List<String> msd(List<String> words, int d) {
        if (words.size() <= 1) return words;
        List<String> out = new ArrayList<>();
        TreeMap<Character, List<String>> buckets = new TreeMap<>();
        for (String w : words) {
            if (w.length() <= d) out.add(w);
            else buckets.computeIfAbsent(w.charAt(d), k -> new ArrayList<>()).add(w);
        }
        for (List<String> b : buckets.values()) out.addAll(msd(b, d + 1));
        return out;
    }

    public static void main(String[] args) {
        System.out.println(String.join(" ", msd(Arrays.asList("she", "sells", "sea", "shells", "by", "the", "sea", "shore", "app", "apple", "ape"), 0)));
        System.out.println(String.join(" ", msd(Arrays.asList("b", "a", "", "ab", "abc", "aa", "a"), 0)));
    }
}
