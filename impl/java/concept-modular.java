public class ConceptModular {
    // 數學上的模：Java 的 % 對負數會得到負餘數，可用 Math.floorMod 修正到 [0, m)
    static int normMod(int a, int m) { return Math.floorMod(a, m); }

    public static void main(String[] args) {
        int[] nums = {-1, 27, 52, 13, -27};
        int m = 26;
        for (int x : nums) System.out.println(x + " mod " + m + " = " + normMod(x, m));
        int a = nums[0], b = nums[1];
        System.out.println("(" + a + " + " + b + ") mod " + m + " = " + normMod(a + b, m) + " = " + normMod(normMod(a, m) + normMod(b, m), m));
        System.out.println("(" + a + " * " + b + ") mod " + m + " = " + normMod(a * b, m) + " = " + normMod(normMod(a, m) * normMod(b, m), m));
        System.out.println("27 ≡ 1 (mod 26): " + (normMod(27, m) == normMod(1, m) ? "True" : "False"));
    }
}
