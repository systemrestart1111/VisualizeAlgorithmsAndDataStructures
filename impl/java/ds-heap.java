import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

public class HeapDemo {
    // 以陣列存放的完全二元樹：i 的子節點在 2i+1、2i+2，父節點在 (i-1)/2；堆頂永遠是最小值
    static class MinHeap {
        List<Integer> a = new ArrayList<>();

        MinHeap() {}

        MinHeap(int[] items) {
            for (int v : items) a.add(v);
            for (int i = a.size() / 2 - 1; i >= 0; i--) siftDown(i); // 自底向上建堆，O(n)
        }

        void push(int v) {
            a.add(v);
            int i = a.size() - 1;
            while (i > 0 && a.get((i - 1) / 2) > a.get(i)) { // 上浮
                Collections.swap(a, i, (i - 1) / 2);
                i = (i - 1) / 2;
            }
        }

        int pop() {
            int top = a.get(0), last = a.remove(a.size() - 1);
            if (!a.isEmpty()) { a.set(0, last); siftDown(0); }
            return top;
        }

        void siftDown(int i) {
            int n = a.size();
            for (;;) {
                int s = i, l = 2 * i + 1, r = 2 * i + 2;
                if (l < n && a.get(l) < a.get(s)) s = l;
                if (r < n && a.get(r) < a.get(s)) s = r;
                if (s == i) return;
                Collections.swap(a, i, s);
                i = s;
            }
        }

        public String toString() {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < a.size(); i++) sb.append(i > 0 ? " " : "").append(a.get(i));
            return sb.append("]").toString();
        }
    }

    public static void main(String[] args) {
        MinHeap h = new MinHeap();
        for (int v : new int[] {35, 12, 48, 7, 20, 3, 41}) { h.push(v); System.out.println(String.format("push %2d: %s", v, h)); }
        System.out.println("peek -> " + h.a.get(0));
        for (int i = 0; i < 3; i++) { int top = h.pop(); System.out.println(String.format("pop -> %2d: %s", top, h)); }
        MinHeap b = new MinHeap(new int[] {9, 4, 7, 1, 8, 2, 6});
        System.out.println("build [9 4 7 1 8 2 6] -> " + b);
        StringBuilder sb = new StringBuilder("heap sort:");
        for (int i = 0; i < 7; i++) sb.append(' ').append(b.pop());
        System.out.println(sb);
    }
}
