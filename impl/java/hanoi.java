public class Hanoi {
    static int count = 0;

    // 把 n 個盤子從 src 移到 dst：先把上面 n-1 個移到 aux，移動最大的，再把 n-1 個移到 dst；共 2^n - 1 步
    static void hanoi(int n, char src, char aux, char dst) {
        if (n == 0) return;
        hanoi(n - 1, src, dst, aux);
        System.out.println(String.format("%2d. disk %d: %c -> %c", ++count, n, src, dst));
        hanoi(n - 1, aux, src, dst);
    }

    public static void main(String[] args) {
        hanoi(4, 'A', 'B', 'C');
        System.out.println("total moves = " + count);
    }
}
