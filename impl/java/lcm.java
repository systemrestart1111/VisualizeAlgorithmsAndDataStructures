public class LCM {
    static long gcd(long a, long b) { return b == 0 ? a : gcd(b, a % b); }

    // lcm(a, b) = a / gcd(a, b) * b；多個數就依序兩兩求（先除後乘，避免溢位）
    public static void main(String[] args) {
        long[] nums = {12, 18, 30, 8};
        long cur = nums[0];
        for (int i = 1; i < nums.length; i++) {
            long g = gcd(cur, nums[i]), nxt = cur / g * nums[i];
            System.out.println("lcm(" + cur + ", " + nums[i] + ") = " + cur + " / " + g + " x " + nums[i] + " = " + nxt);
            cur = nxt;
        }
        System.out.println("lcm = " + cur);
    }
}
