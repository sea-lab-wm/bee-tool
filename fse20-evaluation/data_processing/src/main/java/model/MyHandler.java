package main.java.model;

import org.w3c.dom.Document;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;
import org.xml.sax.SAXException;
import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import javax.xml.parsers.ParserConfigurationException;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public class MyHandler {

    public HashMap<String, List<List<String>>> myHandler(String file) throws ParserConfigurationException, IOException, SAXException {
        String ID = "";
        String title = "";
        HashMap<String, List<List<String>>> sentencesMap = new HashMap<>();
        DocumentBuilderFactory builderFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = builderFactory.newDocumentBuilder();
        Document document = builder.parse(file);
        NodeList list_ID = document.getElementsByTagName("id");
        Node node = list_ID.item(0);
        // ID += node.getTextContent();
        String sub = file.substring(70);
        NodeList list_st = document.getElementsByTagName("st");
        NodeList list_title = document.getElementsByTagName("title");
        int numOB = 0;
        int numEB = 0;
        int numSR = 0;
        int num_nonOB = 0;
        int num_nonEB = 0;
        int num_nonSR = 0;
        List<String> list_stat = new ArrayList<>();
        int num_st =  list_st.getLength();
        int num_title=  list_title.getLength();
        list_stat.add(String.valueOf(num_st));
        list_stat.add(String.valueOf(num_title));
        List<String> allSentences = new ArrayList<>();



        for (int i = 0; i < list_st.getLength(); i++) {
            String sentence = list_st.item(i).getTextContent();
            allSentences.add(sentence);
            if (!list_st.item(i).getAttributes().getNamedItem("ob").getNodeValue().equals("") ) {
                boolean contains_OB = sentencesMap.containsKey("sentences_OB");
                if (contains_OB) {
                    numOB++;
                    List<String> OB_st = new ArrayList<>();
                    OB_st.add(sentence);
                    OB_st.add(sub);
                    sentencesMap.get("sentences_OB").add(OB_st);
                }
                else {
                    List<List<String>> arrayList1 = new ArrayList<>();
                    List<String> OB_st = new ArrayList<>();
                    OB_st.add(sentence);
                    OB_st.add(sub);
                    arrayList1.add(OB_st);
                    numOB++;
                    sentencesMap.put("sentences_OB",  arrayList1);

                }
            }
            if (!list_st.item(i).getAttributes().getNamedItem("eb").getNodeValue().equals("")) {
                boolean contains_EB = sentencesMap.containsKey("sentences_EB");
                if (contains_EB) {
                    numEB++;
                    List<String> EB_st = new ArrayList<>();
                    EB_st.add(sentence);
                    EB_st.add(sub);
                    sentencesMap.get("sentences_EB").add(EB_st);
                } else {
                    List<List<String>> arrayList2 = new ArrayList<>();
                    List<String> EB_st = new ArrayList<>();
                    EB_st.add(sentence);
                    EB_st.add(sub);
                    arrayList2.add(EB_st);
                    numOB++;
                    sentencesMap.put("sentences_EB",  arrayList2);
                }
            }
            if (!list_st.item(i).getAttributes().getNamedItem("sr").getNodeValue().equals("")) {
                boolean contains_SR = sentencesMap.containsKey("sentences_SR");
                if (contains_SR) {
                    numSR++;
                    List<String> SR_st = new ArrayList<>();
                    SR_st.add(sentence);
                    SR_st.add(sub);
                    sentencesMap.get("sentences_SR").add(SR_st);
                } else {
                    List<List<String>> arrayList3 = new ArrayList<>();
                    List<String> SR_st = new ArrayList<>();
                    SR_st.add(sentence);
                    SR_st.add(sub);
                    arrayList3.add(SR_st);
                    numSR++;
                    sentencesMap.put("sentences_SR", arrayList3);
                }
            }
            if (list_st.item(i).getAttributes().getNamedItem("ob").getNodeValue().equals("") ) {
                boolean contains_nonOB = sentencesMap.containsKey("sentences_nonOB");
                if (contains_nonOB) {
                    num_nonOB++;
                    List<String> nonOB_st = new ArrayList<>();
                    nonOB_st.add(sentence);
                    nonOB_st.add(sub);
                    sentencesMap.get("sentences_nonOB").add(nonOB_st);
                }
                else {
                    num_nonOB++;
                    List<List<String>> arrayList4 = new ArrayList<>();
                    List<String> nonOB_st = new ArrayList<>();
                    nonOB_st.add(sentence);
                    nonOB_st.add(sub);
                    arrayList4.add(nonOB_st);
                    sentencesMap.put("sentences_nonOB", arrayList4);
                }
            }
            if (list_st.item(i).getAttributes().getNamedItem("eb").getNodeValue().equals("") ) {
                boolean contains_nonEB = sentencesMap.containsKey("sentences_nonEB");
                num_nonEB++;
                if (contains_nonEB) {
                    List<String> nonEB_st = new ArrayList<>();
                    nonEB_st.add(sentence);
                    nonEB_st.add(sub);
                    sentencesMap.get("sentences_nonEB").add(nonEB_st);
                }
                else {
                    List<List<String>> arrayList5 = new ArrayList<>();
                    List<String> nonEB_st = new ArrayList<>();
                    nonEB_st.add(sentence);
                    nonEB_st.add(sub);
                    arrayList5.add(nonEB_st);
                    sentencesMap.put("sentences_nonEB", arrayList5);
                }
            }
            if (list_st.item(i).getAttributes().getNamedItem("sr").getNodeValue().equals("") ) {
                boolean contains_nonSR = sentencesMap.containsKey("sentences_nonSR");
                if (contains_nonSR) {
                    num_nonSR++;
                    List<String> nonSR_st = new ArrayList<>();
                    nonSR_st.add(sentence);
                    nonSR_st.add(sub);
                    sentencesMap.get("sentences_nonSR").add(nonSR_st);
                }
                else {
                    List<List<String>> arrayList6 = new ArrayList<>();
                    List<String>  nonSR_st = new ArrayList<>();
                    nonSR_st.add(sentence);
                    nonSR_st.add(sub);
                    arrayList6.add(nonSR_st);
                    sentencesMap.put("sentences_nonSR", arrayList6);
                }
            }

        }
        for (int i = 0; i < list_title.getLength(); i++) {
            String sentence = list_title.item(i).getTextContent();
            allSentences.add(sentence);
            if (!list_title.item(i).getAttributes().getNamedItem("ob").getNodeValue().equals("")) {
                boolean contains_OB = sentencesMap.containsKey("sentences_OB");
                if (contains_OB) {
                    numOB++;
                    List<String> OB_st = new ArrayList<>();
                    OB_st.add(sentence);
                    OB_st.add(sub);
                    sentencesMap.get("sentences_OB").add(OB_st);
                }
                else {
                    List<List<String>> arrayList1 = new ArrayList<>();
                    List<String> OB_st = new ArrayList<>();
                    OB_st.add(sentence);
                    OB_st.add(sub);
                    arrayList1.add(OB_st);
                    numOB++;
                    sentencesMap.put("sentences_OB",  arrayList1);

                }
            }
            if (!list_title.item(i).getAttributes().getNamedItem("eb").getNodeValue().equals("")) {
                boolean contains_EB = sentencesMap.containsKey("sentences_EB");
                if (contains_EB) {
                    numEB++;
                    List<String> EB_st = new ArrayList<>();
                    EB_st.add(sentence);
                    EB_st.add(sub);
                    sentencesMap.get("sentences_EB").add(EB_st);
                } else {
                    List<List<String>> arrayList2 = new ArrayList<>();
                    List<String> EB_st = new ArrayList<>();
                    EB_st.add(sentence);
                    EB_st.add(sub);
                    arrayList2.add(EB_st);
                    numOB++;
                    sentencesMap.put("sentences_EB",  arrayList2);
                }
            }
            if (!list_title.item(i).getAttributes().getNamedItem("sr").getNodeValue().equals("")) {
                boolean contains_SR = sentencesMap.containsKey("sentences_SR");
                if (contains_SR) {
                    numSR++;
                    List<String> SR_st = new ArrayList<>();
                    SR_st.add(sentence);
                    SR_st.add(sub);
                    sentencesMap.get("sentences_SR").add(SR_st);
                } else {
                    List<List<String>> arrayList3 = new ArrayList<>();
                    List<String> SR_st = new ArrayList<>();
                    SR_st.add(sentence);
                    SR_st.add(sub);
                    arrayList3.add(SR_st);
                    numSR++;
                    sentencesMap.put("sentences_SR", arrayList3);
                }
            }
            if (list_title.item(i).getAttributes().getNamedItem("ob").getNodeValue().equals("") ) {
                boolean contains_nonOB = sentencesMap.containsKey("sentences_nonOB");
                if (contains_nonOB) {
                    num_nonOB++;
                    List<String> nonOB_st = new ArrayList<>();
                    nonOB_st.add(sentence);
                    nonOB_st.add(sub);
                    sentencesMap.get("sentences_nonOB").add(nonOB_st);
                }
                else {
                    num_nonOB++;
                    List<List<String>> arrayList4 = new ArrayList<>();
                    List<String> nonOB_st = new ArrayList<>();
                    nonOB_st.add(sentence);
                    nonOB_st.add(sub);
                    arrayList4.add(nonOB_st);
                    sentencesMap.put("sentences_nonOB", arrayList4);
                }
            }
            if (list_title.item(i).getAttributes().getNamedItem("eb").getNodeValue().equals("") ) {
                boolean contains_nonEB = sentencesMap.containsKey("sentences_nonEB");
                num_nonEB++;
                if (contains_nonEB) {
                    List<String> nonEB_st = new ArrayList<>();
                    nonEB_st.add(sentence);
                    nonEB_st.add(sub);
                    sentencesMap.get("sentences_nonEB").add(nonEB_st);
                }
                else {
                    List<List<String>> arrayList5 = new ArrayList<>();
                    List<String> nonEB_st = new ArrayList<>();
                    nonEB_st.add(sentence);
                    nonEB_st.add(sub);
                    arrayList5.add(nonEB_st);
                    sentencesMap.put("sentences_nonEB", arrayList5);
                }
            }
            if (list_title.item(i).getAttributes().getNamedItem("sr").getNodeValue().equals("") ) {
                boolean contains_nonSR = sentencesMap.containsKey("sentences_nonSR");
                if (contains_nonSR) {
                    num_nonSR++;
                    List<String> nonSR_st = new ArrayList<>();
                    nonSR_st.add(sentence);
                    nonSR_st.add(sub);
                    sentencesMap.get("sentences_nonSR").add(nonSR_st);
                }
                else {
                    List<List<String>> arrayList6 = new ArrayList<>();
                    List<String>  nonSR_st = new ArrayList<>();
                    nonSR_st.add(sentence);
                    nonSR_st.add(sub);
                    arrayList6.add(nonSR_st);
                    sentencesMap.put("sentences_nonSR", arrayList6);
                }
            }
        }
        //List<String> list = new ArrayList<String>();;
        //list.add(String.valueOf(numOB));
        //list.add(String.valueOf(numEB));
        //list.add(String.valueOf(numSR));
        //list.add(String.valueOf(num_nonOB));
        //list.add(String.valueOf(num_nonEB));
        //list.add(String.valueOf(num_nonSR));
        //sentencesMap.put("num", list);
        //sentencesMap.put("total",list_stat);
        //sentencesMap.put("allSentences", allSentences);

        return sentencesMap;
    }

    public String reportId(String file) throws ParserConfigurationException, IOException, SAXException {
        String ID = "";
        DocumentBuilderFactory builderFactory = DocumentBuilderFactory.newInstance();
        DocumentBuilder builder = builderFactory.newDocumentBuilder();
        Document document = builder.parse(file);
        NodeList list_ID = document.getElementsByTagName("id");
        Node node = list_ID.item(0);
        ID += node.getTextContent();
        String sub = file.substring(70);
        sub = sub + "/" + ID;
        return sub;
    }

}



