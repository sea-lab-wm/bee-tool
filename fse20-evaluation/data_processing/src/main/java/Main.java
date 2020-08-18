package main.java;
import main.java.model.*;
import java.io.*;
import java.util.*;




public class Main {

    public static void main(String[] args) throws Throwable {

        List<List<String>> AllSentences = new ArrayList<>();
        List<List<String>> sentences_OB = new ArrayList<>();
        List<List<String>> sentences_EB = new ArrayList<>();
        List<List<String>> sentences_SR = new ArrayList<>();
        List<List<String>> sentences_nonOB = new ArrayList<>();
        List<List<String>> sentences_nonEB = new ArrayList<>();
        List<List<String>> sentences_nonSR = new ArrayList<>();


        int totalNum = 0;

        // HashMap<String, HashMap<String, Integer>> statistics = new HashMap<>();

        // compute the number of OB,EB,S2R of each bug report
        //String path_stat = "/Users/yangsong/test/src/stat.txt";
        //File statFile = new File(path_stat);
        //BufferedWriter bf_stat = null;
        //bf_stat = new BufferedWriter(new FileWriter(statFile));

        int fileNum = 0;
        int folderNum = 0;
        // Traverse all xml files in the 1_data_nimbus_labeled_with_desc folder non-recursively
        String folderName = "src/1_data_nimbus_labeled_with_desc/1_labeled_data_selected_with_desc/";
        File file = new File(folderName);
        if (file.exists()) {
            LinkedList<File> list = new LinkedList<File>();
            File[] files = file.listFiles();

            for (File file1 : files) {
                if (file1.isDirectory()) {
                    list.add(file1);
                    //folderNum++;                                                                                                                                                                                                                                                             a
                }
            }
            File temp_file;
            while (!list.isEmpty()) {
                temp_file = list.removeFirst();
                files = temp_file.listFiles();
                //HashMap<String,Integer> map = new HashMap<>();
                //map.put("OB",0);
                //map.put("EB",0);
                //map.put("SR",0);
                //map.put("OTHER",0);
                for (File file2 : files) {
                    if (file2.isDirectory()) {
                        list.add(file2);
                        //folderNum++;
                    } else {
                        if (file2.getName().endsWith(".xml")) {
                            fileNum++;
                            BugReport report = new BugReport(file2.getPath(), "eclipse");
                            boolean containsOB = report.sentencesMap.containsKey("sentences_OB");
                            boolean containsEB = report.sentencesMap.containsKey("sentences_EB");
                            boolean containsSR = report.sentencesMap.containsKey("sentences_SR");
                            boolean contains_nonOB = report.sentencesMap.containsKey("sentences_nonOB");
                            boolean contains_nonEB = report.sentencesMap.containsKey("sentences_nonEB");
                            boolean contains_nonSR = report.sentencesMap.containsKey("sentences_nonSR");


                            if (containsOB) {
                                for (int i = 0; i < report.sentencesMap.get("sentences_OB").size(); i++) {
                                    sentences_OB.add(report.sentencesMap.get("sentences_OB").get(i));
                                }
                            }

                            if (containsEB) {

                                for (int i = 0; i < report.sentencesMap.get("sentences_EB").size(); i++) {
                                    sentences_EB.add(report.sentencesMap.get("sentences_EB").get(i));
                                }
                            }

                            if (containsSR) {
                                for (int i = 0; i < report.sentencesMap.get("sentences_SR").size(); i++) {
                                    sentences_SR.add(report.sentencesMap.get("sentences_SR").get(i));

                                }
                            }

                            if (contains_nonOB) {
                                //map.put("OB", map.get("OB") + report.sentencesMap.get("sentences_OB").size());
                                for (int i = 0; i < report.sentencesMap.get("sentences_nonOB").size(); i++) {
                                    sentences_nonOB.add(report.sentencesMap.get("sentences_nonOB").get(i));
                                }
                            }

                            if (contains_nonEB) {
                                //map.put("EB", map.get("EB") + report.sentencesMap.get("sentences_EB").size());
                                for (int i = 0; i < report.sentencesMap.get("sentences_nonEB").size(); i++) {
                                    sentences_nonEB.add(report.sentencesMap.get("sentences_nonEB").get(i));
                                }
                            }

                            if (contains_nonSR) {
                                //map.put("SR",  map.get("SR") + report.sentencesMap.get("sentences_SR").size());
                                for (int i = 0; i < report.sentencesMap.get("sentences_nonSR").size(); i++) {
                                    sentences_nonSR.add(report.sentencesMap.get("sentences_nonSR").get(i));

                                }
                            }
                            //bf_stat.write(report.reportID + " " + report.sentencesMap.get("num").get(0) + " " + report.sentencesMap.get("num").get(1) + " " + report.sentencesMap.get("num").get(2) + " " + report.sentencesMap.get("num").get(3) + " " + report.sentencesMap.get("num").get(4) +   " " + report.sentencesMap.get("num").get(5));
                            //bf_stat.newLine();
                            //totalNum = totalNum + Integer.parseInt(report.sentencesMap.get("total").get(0)) + Integer.parseInt(report.sentencesMap.get("total").get(1));
                        }
                    }
                }
                //statistics.put(temp_file.getName(),map);
            }
        } else {
            System.out.println("this file doesn't exist");
        }
        //bf_stat.flush();
        // System.out.println("There are " + folderNum + "folders, and " + fileNum + "files");
        //System.out.println("The total number of sentences = " + totalNum);

        AllSentences.addAll(sentences_OB);
        AllSentences.addAll(sentences_nonOB);
        //System.out.println(AllSentences.size());
        ExtractFeatures EF = new ExtractFeatures(AllSentences);
        //generate the input vectors for each group.
        EF.GenerateFeature(sentences_OB, sentences_OB.size(), "OB");
        EF.GenerateFeature(sentences_EB, sentences_EB.size(), "EB");
        EF.GenerateFeature(sentences_SR, sentences_SR.size(), "SR");
        EF.GenerateFeature(sentences_nonOB, sentences_nonOB.size(), "nonOB");
        EF.GenerateFeature(sentences_nonEB, sentences_nonEB.size(), "nonEB");
        EF.GenerateFeature(sentences_nonSR, sentences_nonSR.size(), "nonSR");




        // deduplicate the OTHER dataset for undersampling
        /*
        FileReader fr = new FileReader("/Users/yangsong/test/src/data_OTHER.dat");
        BufferedReader BR = new BufferedReader(fr);
        List<String> deOTHER = new ArrayList<String>();
        String senBR = BR.readLine();
        while(BR.readLine() != null) {
            deOTHER.add(senBR);
            senBR = BR.readLine();
        }
        Set<String> set = new HashSet<>(deOTHER);
        deOTHER.clear();
        deOTHER.addAll(set);
        try {
            FileOutputStream fileOutputStreamOTHER = null;
            File deduplication_OTHER = new File("/Users/yangsong/test/src/deduplication_OTHER.dat");
            fileOutputStreamOTHER = new FileOutputStream(deduplication_OTHER, true);
            for (String s : deOTHER) {
                s = s + "\n";
                fileOutputStreamOTHER.write(s.getBytes("utf-8"));
            }
            fileOutputStreamOTHER.close();
        }
        catch (IOException e) {
            e.printStackTrace();
        }

         */





        // output the dictionary to a file: key is 1,2,3-pos tagging and 1,2,3-gram, value is the index
        HashMap<String, Integer> DictContent = null;
        DictContent = EF.dict;
        String path = "/Users/yangsong/test/src/dict.txt";
        File file1 = new File(path);
        BufferedWriter bf = null;;
        try{
            //create new BufferedWriter for the output file
            bf = new BufferedWriter( new FileWriter(file1));  //iterate map entries
            for(Map.Entry<String, Integer> entry : DictContent.entrySet()){
                bf.write( entry.getKey() + ":" + entry.getValue() );
                //new line
                bf.newLine();
            }
            bf.flush();
        }catch(IOException e){
            e.printStackTrace();
        }



        Upsampling us = new Upsampling();
        us.Smote("/Users/yangsong/test/src/dataC_OB.dat","/Users/yangsong/test/src/data_OB_final.dat","/Users/yangsong/test/src/final_OB.dat","/Users/yangsong/test/src/dataC_nonOB.dat","/Users/yangsong/test/src/finalC_OB_1.dat",10,7);
        us.Smote("/Users/yangsong/test/src/dataC_EB.dat","/Users/yangsong/test/src/data_EB_final.dat","/Users/yangsong/test/src/final_EB.dat","/Users/yangsong/test/src/dataC_nonEB.dat","/Users/yangsong/test/src/finalC_EB_1.dat",58,55);
        us.Smote("/Users/yangsong/test/src/dataC_SR.dat","/Users/yangsong/test/src/data_SR_final.dat","/Users/yangsong/test/src/final_SR.dat","/Users/yangsong/test/src/dataC_nonSR.dat","/Users/yangsong/test/src/finalC_SR_1.dat",17,14);



    }

}
