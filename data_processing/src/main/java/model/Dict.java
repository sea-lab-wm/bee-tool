package main.java.model;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;

import java.util.*;
public class Dict {
    HashMap<String,Integer> word2Index = null;

    //this sentenceList is the collection of OB,EB,SR,OTHER
    public Dict (List<List<String>> sentencesList) throws Throwable {
        Properties props = new Properties();  // set up pipeline properties
        props.put("annotators", "tokenize, ssplit, pos, lemma");
        StanfordCoreNLP pipeline = new StanfordCoreNLP(props);
        word2Index = new HashMap<>();
        //word2Count = new Hashtable<String,Integer>();
        int index = 1;
        for (int i = 0; i < sentencesList.size(); i++) {
            String singleLine = sentencesList.get(i).get(0);
            HashMap<String,List<String>> TokenPos =  new getTokenPos().extractTokens(singleLine,pipeline);
            List<String> sl = TokenPos.get("tokens");
            List<String> posT = TokenPos.get("pos");
            int Num = sl.size();
            for (int j = 0; j < Num; j++) {
                String term = sl.get(j);
                //String postag = pT.tags.get(j);
                boolean containsT = word2Index.containsKey(term);
                if (!containsT) {
                    word2Index.put(term, index++);
                }
                String postag = posT.get(j);
                boolean containsP = word2Index.containsKey(postag);
                if (!containsP) {
                    word2Index.put(postag, index++);
                }
            }
            //bigrams
            for (int k = 0; k < Num - 1; k++) {
                //concat two tokens to a string
                String bigram = sl.get(k).concat(" ").concat(sl.get(k + 1));
                boolean contains = word2Index.containsKey(bigram);
                if (!contains) {
                    word2Index.put(bigram, index++);
                }
                String pos2tag = posT.get(k).concat(" ").concat(posT.get(k + 1));
                boolean containsT = word2Index.containsKey(pos2tag);
                if (!containsT) {
                    word2Index.put(pos2tag, index++);
                }
            }
            //trigrams
            for (int m = 0; m < Num - 2; m++) {
                String trigram = sl.get(m).concat(" ").concat(sl.get(m + 1)).concat(" ").concat(sl.get(m + 2));
                boolean contains = word2Index.containsKey(trigram);
                if (!contains) {
                    word2Index.put(trigram, index++);
                }
                String pos3tag = posT.get(m).concat(" ").concat(posT.get(m+1)).concat(" ").concat(posT.get(m+2));
                boolean containsT = word2Index.containsKey(pos3tag);
                if (!containsT) {
                    word2Index.put(pos3tag, index++);
                }
            }
        }
    }

    public HashMap<String, Integer> getWord2Index() throws Throwable {
        if(word2Index==null)
            throw new Exception("has not loaded file!");
        return word2Index;
    }


}
