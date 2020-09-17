package main.java.model;

import edu.stanford.nlp.ling.CoreAnnotations;
import edu.stanford.nlp.ling.CoreLabel;
import edu.stanford.nlp.pipeline.Annotation;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;
import edu.stanford.nlp.util.CoreMap;

import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;

public class getTokenPos {

    public HashMap<String,List<String>> extractTokens(String documentText, StanfordCoreNLP pipeline) {
            documentText =  documentText.replaceAll("[\\u009C\\u200C\\uFE55\\u009F\\u0083\\u009B]", "");
            Annotation document= new Annotation(documentText);
            pipeline.annotate( document);
            List<CoreMap> sentences=  document.get(CoreAnnotations.SentencesAnnotation.class);
            List<String> tokenList = new ArrayList<>();
            List<String> posTags = new ArrayList<>();
            for (CoreMap sentence : sentences) {
                // traversing the words in the current sentence
                // a CoreLabel is a CoreMap with additional token-specific methods
                for (CoreLabel token : sentence.get(CoreAnnotations.TokensAnnotation.class)) {
                    String lema = token.get(CoreAnnotations.LemmaAnnotation.class);
                    String pos = token.get(CoreAnnotations.PartOfSpeechAnnotation.class);
                    tokenList.add(lema);
                    posTags.add(pos);
                }
            }
            Collections.replaceAll(tokenList, "-lrb-", "(");
            Collections.replaceAll(tokenList, "-rrb-", ")");
            Collections.replaceAll(tokenList, "-lsb-", "[");
            Collections.replaceAll(tokenList, "-rsb-", "]");
            Collections.replaceAll(tokenList, "-lcb-", "{");
            Collections.replaceAll(tokenList, "-rcb-", "}");
            Collections.replaceAll(posTags, "-lrb-", "(");
            Collections.replaceAll(posTags, "-rrb-", ")");
            Collections.replaceAll(posTags, "-lsb-", "[");
            Collections.replaceAll(posTags, "-rsb-", "]");
            Collections.replaceAll(posTags, "-lcb-", "{");
            Collections.replaceAll(posTags, "-rcb-", "}");
            HashMap<String, List<String>> tokenPos = new HashMap<>();
            tokenPos.put("tokens",tokenList);
            tokenPos.put("pos",posTags);
            return tokenPos;
    }
}
