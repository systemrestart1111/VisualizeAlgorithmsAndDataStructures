public class ModPow {
    // 由高位到低位的平方乘法：每讀一個位元就把結果平方，該位是 1 再乘上 a；全程取模讓數字保持很小
    static long modPow(long a, long n, long m) {
        long result = 1;
        for (char bit : Long.toBinaryString(n).toCharArray()) {
            result = result * result % m;
            if (bit == '1') result = result * a % m;
            System.out.println("bit " + bit + ": " + result);
        }
        return result;
    }

    public static void main(String[] args) {
        System.out.println("7^560 mod 561 = " + modPow(7, 560, 561));
    }
}
