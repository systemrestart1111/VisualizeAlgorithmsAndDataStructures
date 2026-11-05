import java.util.*;

public class ColumnarTransposition {
    // 依（字母, 欄號）穩定排序，重複字母保持出現順序
    static Integer[] colOrder(String key) {
        Integer[] o = new Integer[key.length()];
        for (int i = 0; i < o.length; i++) o[i] = i;
        Arrays.sort(o, Comparator.comparingInt((Integer c) -> key.charAt(c)).thenComparingInt(c -> c));
        return o;
    }
    static String encrypt(String text, String key) {
        StringBuilder t = new StringBuilder(text.toUpperCase().replaceAll("[^A-Z]", ""));
        int w = key.length();
        while (t.length() % w != 0) t.append('X');
        StringBuilder out = new StringBuilder();
        for (int c : colOrder(key))
            for (int r = 0; r < t.length() / w; r++) out.append(t.charAt(r * w + c));
        return out.toString();
    }
    static String decrypt(String cph, String key) {
        int w = key.length(), rows = cph.length() / w, k = 0;
        char[] out = new char[cph.length()];
        for (int c : colOrder(key))
            for (int r = 0; r < rows; r++) out[r * w + c] = cph.charAt(k++);
        return new String(out);
    }

    public static void main(String[] args) {
        String c = encrypt("WE ARE DISCOVERED FLEE AT ONCE", "ZEBRAS");
        System.out.println("cipher: " + c);
        System.out.println("plain : " + decrypt(c, "ZEBRAS"));
        System.out.println("dup key: " + encrypt("HELLOWORLD", "BANANA"));
    }
}
