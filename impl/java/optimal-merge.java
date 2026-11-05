import java.util.List;
import java.util.PriorityQueue;

public class OptimalMerge {
    // 每次合併最短的兩個檔案（與霍夫曼編碼同樣的貪婪策略），總搬移成本最小
    public static void main(String[] args) {
        PriorityQueue<Integer> pq = new PriorityQueue<>(List.of(20, 30, 10, 5, 30, 15));
        int total = 0;
        while (pq.size() > 1) {
            int a = pq.poll(), b = pq.poll();
            total += a + b;
            pq.add(a + b);
            System.out.println("merge " + a + " + " + b + " = " + (a + b));
        }
        System.out.println("total cost = " + total);
    }
}
