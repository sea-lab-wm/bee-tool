package main.java.model;
import java.util.*;
public class Common {
    public String listToString5(List list, char separator) {
        return org.apache.commons.lang3.StringUtils.join(list.toArray(),separator);
    };

    public int findDupe(int[] a, int[] b) {
        HashSet<Integer> map = new HashSet<Integer>();
        int num = 0;
        for (int i : a)
            map.add(i);
        for (int i : b) {
            if (map.contains(i)) {
                num++;
            }
        }
        return num;
    }

    public int[] union(int [] arr1, int [] arr2) {
        Set<Integer> set = new HashSet<Integer>();

        for (int str : arr1) {
            set.add(str);
        }

        for (int str : arr2) {
            set.add(str);
        }

        int [] result = new int[set.size()];
        int i = 0;
        for (int n :set){
            result[i]= n;
            i++;
        }
        Arrays.sort(result);
        return result;

    }
    public int[] intersect(int [] arr1, int [] arr2) {
        List<Integer> l = new LinkedList<Integer>();
        Set<Integer> common = new HashSet<Integer>();
        for(Integer str:arr1){
            if(!l.contains(str)){
                l.add(str);
            }
        }
        for(Integer str:arr2){
            if(l.contains(str)){
                common.add(str);
            }
        }
        int i = 0;
        int[] result= new int[common.size()];
        for ( int n: common){
            result[i] = n;
            i++;
        }
        return result;
    }
}


