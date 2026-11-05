public class CaesarCipher {
    // 每個字母位移 k 格（mod 26），保留大小寫，非字母原樣輸出
    static String caesar(String text, int k) {
        k = Math.floorMod(k, 26);
        StringBuilder sb = new StringBuilder();
        for (char ch : text.toCharArray()) {
            if (ch >= 'A' && ch <= 'Z') sb.append((char) ('A' + (ch - 'A' + k) % 26));
            else if (ch >= 'a' && ch <= 'z') sb.append((char) ('a' + (ch - 'a' + k) % 26));
            else sb.append(ch);
        }
        return sb.toString();
    }

    public static void main(String[] args) {
        String msg = "Hello, World! XYZ";
        String c = caesar(msg, 3);
        System.out.println("encrypt k=3: " + c);
        System.out.println("decrypt   : " + caesar(c, -3));
        for (int k : new int[]{0, 25, 26}) System.out.println("k=" + k + ": " + caesar(msg, k));
    }
}
