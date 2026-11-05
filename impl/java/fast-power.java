public class FastPower {
    // 把 n 看成二進位，由低位到高位：base 每次平方，該位是 1 時就乘進結果，只需 O(log n) 次乘法
    static long fastPower(long a, long n) {
        long result = 1, base = a;
        while (n > 0) {
            long bit = n & 1;
            if (bit == 1) result *= base;
            System.out.println("bit " + bit + ": result = " + result + ", base = " + base);
            base *= base;
            n >>= 1;
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println("3^13 = " + fastPower(3, 13));
    }
}
