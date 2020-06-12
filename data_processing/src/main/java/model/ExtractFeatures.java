package main.java.model;

import edu.stanford.nlp.pipeline.StanfordCoreNLP;

import java.io.*;
import java.util.*;

public class ExtractFeatures {
    //public Dict_POS dictPos;
    //public Dict_Ngram dictNgram;
    public SentenceFeatureFactory sff;
    public HashMap<String, Integer> dict = new HashMap<String, Integer>();

    public ExtractFeatures(List<List<String>> path) throws Throwable {
        this.dict= new Dict(path).getWord2Index();
        this.sff = new SentenceFeatureFactory(this.dict);
        // integrate two maps
        /*
        this.dict.putAll(DN.getWord2Index());
        int n = DN.getWord2Index().size();
        if (n != DPos.getWord2Index().size()){
            System.out.println("two dicts' length is not equal");
        }
        for (Map.Entry<String, Integer> entry : DPos.getWord2Index().entrySet()) {
            dict.put(entry.getKey(), entry.getValue() + n);
        }
        this.dict.putAll(DPos.getWord2Index());
        */
    }

    public void GenerateFeature(List<List<String>> sentenceSet, int sentenceNum, String info) throws Throwable {
        Properties props = new Properties();  // set up pipeline properties
        props.put("annotators", "tokenize, ssplit, pos, lemma");
        StanfordCoreNLP pipeline = new StanfordCoreNLP(props);

        if (info.equals("OB")) {
            String pathname = "/Users/yangsong/test/src/dataC_OB.dat";
            File file = new File(pathname);
            FileOutputStream fileOutputStream = null;
            if (!file.exists()) {
                try {
                    file.createNewFile();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            try {
                fileOutputStream = new FileOutputStream(file, true);
                for (int i = 0; i < sentenceNum; i++) {
                    List<String>sentence = sentenceSet.get(i);
                    int[] temp = sff.get_Feature(sentence.get(0), pipeline);
                    StringBuilder stringBuffer = new StringBuilder();
                    stringBuffer.append(1).append(" ");
                    for (int j = 0; j < temp.length; j++) {
                        stringBuffer.append(temp[j]).append(":").append(1).append(" ");
                        if (j == temp.length - 1 && temp[j] < this.dict.size()) {
                            stringBuffer.append(this.dict.size()).append(":").append(0).append(" ");
                        }
                    }
                    stringBuffer.append("#").append(sentence.get(1));
                    stringBuffer.append("\n");
                    fileOutputStream.write(stringBuffer.toString().getBytes("utf-8"));
                }
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                try {
                    fileOutputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        if (info.equals("EB")) {
            String pathname = "/Users/yangsong/test/src/dataC_EB.dat";
            File file = new File(pathname);
            FileOutputStream fileOutputStream = null;
            if (!file.exists()) {
                try {
                    file.createNewFile();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            try {
                fileOutputStream = new FileOutputStream(file, true);
                for (int i = 0; i < sentenceNum; i++) {
                    List<String>sentence = sentenceSet.get(i);
                    int[] temp = sff.get_Feature(sentence.get(0), pipeline);
                    StringBuilder stringBuffer = new StringBuilder();
                    stringBuffer.append(1).append(" ");
                    for (int j = 0; j < temp.length; j++) {
                        stringBuffer.append(temp[j]).append(":").append(1).append(" ");
                        if (j == temp.length - 1 && temp[j] < this.dict.size()) {
                            stringBuffer.append(this.dict.size()).append(":").append(0).append(" ");
                        }
                    }
                    stringBuffer.append("#").append(sentence.get(1));
                    stringBuffer.append("\n");
                    fileOutputStream.write(stringBuffer.toString().getBytes("utf-8"));
                }
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                try {
                    fileOutputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        if (info.equals("SR")) {
            String pathname = "/Users/yangsong/test/src/dataC_SR.dat";
            File file = new File(pathname);
            FileOutputStream fileOutputStream = null;
            if (!file.exists()) {
                try {
                    file.createNewFile();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            try {
                fileOutputStream = new FileOutputStream(file, true);
                for (int i = 0; i < sentenceNum; i++) {
                    List<String>sentence = sentenceSet.get(i);
                    int[] temp = sff.get_Feature(sentence.get(0), pipeline);
                    StringBuilder stringBuffer = new StringBuilder();
                    stringBuffer.append(1).append(" ");
                    for (int j = 0; j < temp.length; j++) {
                        stringBuffer.append(temp[j]).append(":").append(1).append(" ");
                        if (j == temp.length - 1 && temp[j] < this.dict.size()) {
                            stringBuffer.append(this.dict.size()).append(":").append(0).append(" ");
                        }
                    }
                    stringBuffer.append("#").append(sentence.get(1));
                    stringBuffer.append("\n");
                    fileOutputStream.write(stringBuffer.toString().getBytes("utf-8"));
                }
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                try {
                    fileOutputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        if (info.equals("nonOB")) {
            String pathname = "/Users/yangsong/test/src/dataC_nonOB.dat";
            File file = new File(pathname);
            FileOutputStream fileOutputStream = null;
            if (!file.exists()) {
                try {
                    file.createNewFile();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            try {
                fileOutputStream = new FileOutputStream(file, true);
                for (int i = 0; i < sentenceNum; i++) {
                    List<String>sentence = sentenceSet.get(i);
                    int[] temp = sff.get_Feature(sentence.get(0), pipeline);
                    StringBuilder stringBuffer = new StringBuilder();
                    stringBuffer.append("-1").append(" ");
                    for (int j = 0; j < temp.length; j++) {
                        stringBuffer.append(temp[j]).append(":").append(1).append(" ");
                        if (j == temp.length - 1 && temp[j] < this.dict.size()) {
                            stringBuffer.append(this.dict.size()).append(":").append(0).append(" ");
                        }
                    }
                    stringBuffer.append("#").append(sentence.get(1));
                    stringBuffer.append("\n");
                    fileOutputStream.write(stringBuffer.toString().getBytes("utf-8"));
                }
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                try {
                    fileOutputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        if (info.equals("nonEB")) {
            String pathname = "/Users/yangsong/test/src/dataC_nonEB.dat";
            File file = new File(pathname);
            FileOutputStream fileOutputStream = null;
            if (!file.exists()) {
                try {
                    file.createNewFile();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            try {
                fileOutputStream = new FileOutputStream(file, true);
                for (int i = 0; i < sentenceNum; i++) {
                    List<String>sentence = sentenceSet.get(i);
                    int[] temp = sff.get_Feature(sentence.get(0), pipeline);
                    StringBuilder stringBuffer = new StringBuilder();
                    stringBuffer.append("-1").append(" ");
                    for (int j = 0; j < temp.length; j++) {
                        stringBuffer.append(temp[j]).append(":").append(1).append(" ");
                        if (j == temp.length - 1 && temp[j] < this.dict.size()) {
                            stringBuffer.append(this.dict.size()).append(":").append(0).append(" ");
                        }
                    }
                    stringBuffer.append("#").append(sentence.get(1));
                    stringBuffer.append("\n");
                    fileOutputStream.write(stringBuffer.toString().getBytes("utf-8"));
                }
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                try {
                    fileOutputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
        if (info.equals("nonSR")) {
            String pathname = "/Users/yangsong/test/src/dataC_nonSR.dat";
            File file = new File(pathname);
            FileOutputStream fileOutputStream = null;
            if (!file.exists()) {
                try {
                    file.createNewFile();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }

            try {
                fileOutputStream = new FileOutputStream(file, true);
                for (int i = 0; i < sentenceNum; i++) {
                    List<String> sentence = sentenceSet.get(i);
                    int[] temp = sff.get_Feature(sentence.get(0), pipeline);
                    StringBuilder stringBuffer = new StringBuilder();
                    stringBuffer.append("-1").append(" ");
                    for (int j = 0; j < temp.length; j++) {
                        stringBuffer.append(temp[j]).append(":").append(1).append(" ");
                        if (j == temp.length - 1 && temp[j] < this.dict.size()) {
                            stringBuffer.append(this.dict.size()).append(":").append(0).append(" ");
                        }
                    }
                    stringBuffer.append("#").append(sentence.get(1));
                    stringBuffer.append("\n");
                    fileOutputStream.write(stringBuffer.toString().getBytes("utf-8"));
                }
            } catch (IOException e) {
                e.printStackTrace();
            } finally {
                try {
                    fileOutputStream.close();
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }
}
