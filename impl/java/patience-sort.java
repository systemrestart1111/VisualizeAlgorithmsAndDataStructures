import java.util.*;

public class PatienceSort {
    // 發牌到「牌頂 ≥ x」的最左牌堆；再用最小堆積多路合併各堆牌頂
    public static void main(String[] args) {
        int[] a = {6, 3, 9, 2, 8, 3, 7, 1, 5, 4, 9};
        List<Deque<Integer>> piles = new ArrayList<>();
        for (int x : a) {
            int lo = 0, hi = piles.size();
            while (lo < hi) { int m = (lo + hi) / 2; if (piles.get(m).peekLast() >= x) hi = m; else lo = m + 1; }
            if (lo == piles.size()) piles.add(new ArrayDeque<>());
            piles.get(lo).addLast(x);
        }
        PriorityQueue<int[]> pq = new PriorityQueue<>((p, q) -> p[0] != q[0] ? Integer.compare(p[0], q[0]) : Integer.compare(p[1], q[1]));
        for (int i = 0; i < piles.size(); i++) pq.add(new int[]{piles.get(i).peekLast(), i});
        StringBuilder sb = new StringBuilder("sorted:");
        while (!pq.isEmpty()) {
            int[] t = pq.poll();
            sb.append(' ').append(t[0]);
            Deque<Integer> p = piles.get(t[1]);
            p.pollLast();
            if (!p.isEmpty()) pq.add(new int[]{p.peekLast(), t[1]});
        }
        System.out.println("piles: " + piles.size());
        System.out.println(sb);
    }
}
