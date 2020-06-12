package main.java.model;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import javax.xml.parsers.ParserConfigurationException;

import edu.stanford.nlp.ling.CoreAnnotations;
import edu.stanford.nlp.ling.CoreLabel;
import edu.stanford.nlp.pipeline.Annotation;
import edu.stanford.nlp.pipeline.StanfordCoreNLP;
import edu.stanford.nlp.util.CoreMap;
import org.xml.sax.SAXException;

public class BugReport {
    public String fileID;
    public String system;
    public String reportID;
    public String title;
    public List<String> paragraphs;
    public HashMap<String,List<List<String>>> sentencesMap;

    public BugReport(String fileID,String system) throws ParserConfigurationException, SAXException, IOException { //构造函数
        System.setProperty("file.encoding", "UTF-8");
        this.sentencesMap = new HashMap<>();
        this.fileID = fileID;
        this.system = system;
        this.title = "";
        this.reportID = this.report();
        this.sentencesMap = this.classifyBugReportContent();

    }
    public HashMap<String,List<List<String>>>classifyBugReportContent() throws IOException, SAXException, ParserConfigurationException {
            MyHandler myhandler = new MyHandler();
            return myhandler.myHandler(fileID); //return a sentenceMap
    }
    public String report() throws ParserConfigurationException, IOException, SAXException {
        MyHandler myhandler = new MyHandler();
        return myhandler.reportId(fileID);
    }

}

