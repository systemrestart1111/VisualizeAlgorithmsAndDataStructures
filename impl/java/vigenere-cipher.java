public class VigenereCipher {
    // 關鍵字字母決定位移；非字母原樣輸出且不消耗關鍵字位置
    static String vigenere(String text, String key, boolean decrypt) {
        String K = key.toUpperCase();
        StringBuilder sb = new StringBuilder();
        int j = 0;
        for (char ch : text.toCharArray()) {
            boolean up = ch >= 'A' && ch <= 'Z', low = ch >= 'a' && ch <= 'z';
            if (!up && !low) { sb.append(ch); continue; }
            int k = K.charAt(j % K.length()) - 'A';
            if (decrypt) k = 26 - k;
            char base = up ? 'A' : 'a';
            sb.append((char) (base + (ch - base + k) % 26));
            j++;
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        String c = vigenere("ATTACK AT DAWN!", "LEMON", false);
        System.out.println("cipher: " + c);
        System.out.println("plain : " + vigenere(c, "LEMON", true));
        System.out.println("mixed : " + vigenere("Hello, World", "key", false));
    }
}
