public class OneTimePad {
    static long s = 42;
    // 與其他語言一致的示範亂數；真正的 OTP 需要密碼學安全的亂數
    static int randByte() { s = s * 48271 % 2147483647; return (int) (s % 256); }
    static String hex(int[] b) {
        StringBuilder sb = new StringBuilder();
        for (int x : b) sb.append(String.format("%02x", x));
        return sb.toString();
    }

    public static void main(String[] args) {
        String m1 = "HELLO WORLD", m2 = "SECRET PLAN";
        int n = m1.length();
        int[] key = new int[n], c1 = new int[n], c2 = new int[n], x1 = new int[n], x2 = new int[n];
        StringBuilder back = new StringBuilder();
        for (int i = 0; i < n; i++) key[i] = randByte();
        boolean same = true;
        for (int i = 0; i < n; i++) {
            c1[i] = m1.charAt(i) ^ key[i]; c2[i] = m2.charAt(i) ^ key[i];
            back.append((char) (c1[i] ^ key[i]));
            x1[i] = c1[i] ^ c2[i]; x2[i] = m1.charAt(i) ^ m2.charAt(i);
            same &= x1[i] == x2[i];
        }
        System.out.println("key : " + hex(key));
        System.out.println("c1  : " + hex(c1));
        System.out.println("back: " + back);
        System.out.println("c1^c2: " + hex(x1));
        System.out.println("m1^m2: " + hex(x2));
        System.out.println("key reuse leaks m1^m2: " + (same ? "True" : "False"));
    }
}
