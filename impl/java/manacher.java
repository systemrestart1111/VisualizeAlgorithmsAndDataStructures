public class Manacher {
    // 在字元間插入 #，奇偶長度回文統一處理；利用目前最右回文的對稱性，p[i] 可從鏡像位置繼承，O(n)
    public static void main(String[] args) {
        String s = "babcbabcbaccba";
        StringBuilder sb = new StringBuilder("#");
        for (char ch : s.toCharArray()) sb.append(ch).append('#');
        String t = sb.toString();
        int n = t.length();
        int[] p = new int[n]; // p[i] = 以 i 為中心的回文半徑（不含中心）
        for (int i = 0, c = 0, r = 0; i < n; i++) {
            if (i < r) p[i] = Math.min(r - i, p[2 * c - i]);
            while (i - p[i] - 1 >= 0 && i + p[i] + 1 < n && t.charAt(i - p[i] - 1) == t.charAt(i + p[i] + 1)) p[i]++;
            if (i + p[i] > r) { c = i; r = i + p[i]; }
        }
        int best = 0;
        for (int i = 1; i < n; i++) if (p[i] > p[best]) best = i; // 同長度取最先出現的
        int start = (best - p[best]) / 2;
        System.out.println("longest palindrome = " + s.substring(start, start + p[best]) + "\nstart = " + start + " length = " + p[best]);
    }
}
