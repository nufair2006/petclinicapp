package org.springframework.samples.petclinic.model;

public class TestClass {
        public void test() {
            String s = null;
            s.toString(); // Null dereference
        }

    Integer i = new Integer(5);  // DM_NUMBER_CTOR (should use Integer.valueOf)
    int j = i.intValue();


    private int counter;

    public synchronized void increment() {
        counter++;
    }

    public int getCounter() {  // IS2_INCONSISTENT_SYNC
        return counter;       // not synchronized
    }

    public boolean check(Object obj) {
        return "test".equals(123); // EC_UNRELATED_TYPES
    }

    public boolean isValid(String s) {
        return s == "hello"; // ES_COMPARING_STRINGS_WITH_EQ
    }

    public String buildString() {
        String result = "";
        for (int i = 0; i < 100; i++) {
            result = result + i; // SBSC_USE_STRINGBUFFER_CONCATENATION
        }
        return result;
    }

    private final int[] numbers = {1, 2, 3};

    public int[] getNumbers() {  // EI_EXPOSE_REP
        return numbers;
    }
}
