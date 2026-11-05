public class RLE {
    // 把連續重複的字元壓成「次數 + 字元」
    static String encode(String s) {
        StringBuilder out = new StringBuilder();
        for (int i = 0; i < s.length();) {
            int j = i;
            while (j < s.length() && s.charAt(j) == s.charAt(i)) j++;
            out.append(j - i).append(s.charAt(i));
            i = j;
        }
        return out.toString();
    }

    static String decode(String code) {
        StringBuilder out = new StringBuilder();
        int num = 0;
        for (char ch : code.toCharArray()) {
            if (Character.isDigit(ch)) num = num * 10 + (ch - '0');
            else { out.append(String.valueOf(ch).repeat(num)); num = 0; }
        }
        return out.toString();
    }

    public static void main(String[] args) {
        String s = "WWWWWWWWWWWWBWWWWWWWWWWWWBBBWWWWWWWWWWWWWWWWWWWWWWWWBWWWWWWWWWWWWWW";
        String code = encode(s);
        System.out.println("encoded: " + code);
        System.out.println("length " + s.length() + " -> " + code.length() + ", decode ok: " + (decode(code).equals(s) ? "True" : "False"));
    }
}
