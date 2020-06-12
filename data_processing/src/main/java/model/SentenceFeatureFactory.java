package main.java.model;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;

import java.util.*;

public class SentenceFeatureFactory {
    public HashMap<String,Integer> word2Index;
    public int dim;

    public SentenceFeatureFactory(HashMap<String,Integer> w2i) {
        this.word2Index = w2i;
        this.dim = w2i.size(); // the number of 1,2,3-gram
        System.out.println(this.dim);

    }
    public int[] get_Feature(String sent,StanfordCoreNLP pipeline) throws Throwable {
        HashMap<Integer,Integer> map = new HashMap<Integer,Integer>();
        HashMap<String, List<String>> map1 = new getTokenPos().extractTokens(sent,pipeline);
        // unigram/1-pos
        List<String> tokens = map1.get("tokens");
        List<String> tags= map1.get("pos");
        for (int i = 0; i < tokens.size(); i++) {
                String unigram = tokens.get(i);
                if (word2Index.get(unigram) != null) {
                    map.put(word2Index.get(unigram), 1);
                }
                 String tag_1 = tags.get(i);
                if (word2Index.get(tag_1) != null) {
                    map.put(word2Index.get(tag_1), 1);
                }
        }

        // bigram/2-pos
        for (int k = 0; k < tokens.size() - 1; k++) {
                String bigram = tokens.get(k).concat(" ").concat(tokens.get(k + 1));
                if (word2Index.get(bigram) != null) {
                    map.put(word2Index.get(bigram), 1);
                }
                String pos2tag = tags.get(k).concat(" ").concat(tags.get(k + 1));
                if (word2Index.get(pos2tag) != null) {
                    map.put(word2Index.get(pos2tag), 1);
                }
        }
            //trigram/3-pos
        for (int m = 0; m < tokens.size() - 2; m++) {
                String trigram = tokens.get(m).concat(" ").concat(tokens.get(m + 1)).concat(" ").concat(tokens.get(m + 2));

                if (word2Index.get(trigram) != null) {
                    map.put(word2Index.get(trigram), 1);
                }
                String pos3tag = tags.get(m).concat(" ").concat(tags.get(m + 1)).concat(" ").concat(tags.get(m + 2));
                if (word2Index.get(pos3tag) != null) {
                    map.put(word2Index.get(pos3tag), 1);
                 }
        }


        List<Integer> list =new ArrayList(map.keySet());
        Collections.sort(list);
        int[] arr = new int[list.size()];
         // ArrayList to Array Conversion
        for (int n = 0; n < list.size(); n++)
            arr[n] = list.get(n);

        return arr;
    }
}
