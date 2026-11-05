public class DequeDemo {
    // 雙端佇列：用環狀陣列實作，兩端都能 O(1) 加入與移除；滿了就把容量加倍
    static class Deque {
        int[] buf = new int[4];
        int head = 0, size = 0;

        void grow() {
            int[] nb = new int[buf.length * 2];
            for (int i = 0; i < size; i++) nb[i] = buf[(head + i) % buf.length];
            buf = nb;
            head = 0;
        }

        void pushFront(int v) {
            if (size == buf.length) grow();
            head = (head - 1 + buf.length) % buf.length;
            buf[head] = v;
            size++;
        }

        void pushBack(int v) {
            if (size == buf.length) grow();
            buf[(head + size) % buf.length] = v;
            size++;
        }

        int popFront() {
            int v = buf[head];
            head = (head + 1) % buf.length;
            size--;
            return v;
        }

        int popBack() { size--; return buf[(head + size) % buf.length]; }

        public String toString() {
            StringBuilder sb = new StringBuilder("[");
            for (int i = 0; i < size; i++) sb.append(i > 0 ? " " : "").append(buf[(head + i) % buf.length]);
            return sb.append("] cap=").append(buf.length).toString();
        }
    }

    public static void main(String[] args) {
        Deque d = new Deque();
        d.pushBack(1); d.pushBack(2); d.pushFront(0);
        System.out.println("push_back 1, push_back 2, push_front 0: " + d);
        d.pushFront(-1); d.pushBack(3);
        System.out.println("push_front -1, push_back 3: " + d);
        int a = d.popFront(), b = d.popBack();
        System.out.println("pop_front -> " + a + "  pop_back -> " + b + "  " + d);
    }
}
