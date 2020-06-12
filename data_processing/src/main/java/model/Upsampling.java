package main.java.model;

import java.io.*;
import java.util.*;;
import org.apache.commons.lang3.ArrayUtils;
import java.io.LineNumberReader;
public class Upsampling {

    public void Smote(String filePath, String newFilePath, String filePathFinal, String other_file, String final_DATA, int k, int rate) throws IOException {

        String str = null;
        int[][] min_orignal;
        int col = 0;
        File file = new File(filePath);
        int linenumber = 0;
        if (file.exists()) {
            FileReader fr = new FileReader(file);
            LineNumberReader lnr = new LineNumberReader(fr);
            while (lnr.readLine() != null) {
                linenumber++;
            }
            System.out.println("Total number of lines : " + linenumber);
            lnr.close();
        } else {
            System.out.println("File does not exists!");
        }
        int len = linenumber;
        int num_k = k;
        int num_rate = rate;
        min_orignal = new int[len][];
        try (FileInputStream inputStream = new FileInputStream(filePath);
             BufferedReader bufferedReader = new BufferedReader(new InputStreamReader(inputStream));) {
            while ((str = bufferedReader.readLine()) != null) {
                str  = str.substring(0,str.indexOf("#"));
                String[] string = str.split("\\s+");
                min_orignal[col] = new int[string.length - 1];
                for (int i = 1; i < string.length; i++) {
                    String[] shuzi = string[i].split(":");
                    min_orignal[col][i - 1] = Integer.parseInt(shuzi[0]);
                }
                col++;
            }

        } catch (IOException e) {
            e.printStackTrace();
        }
        // begin to compute Adjacency matrix
        Common find = new Common();
        int[][] dis_matrix = new int[len][len];
        for (int i = 0; i < len; i++) {
            for (int j = 0; j < len; j++) {
                int[] tmpVector1 = min_orignal[i];
                int[] tmpVector2 = min_orignal[j];
                dis_matrix[i][j] = tmpVector1.length + tmpVector2.length - find.findDupe(tmpVector1, tmpVector2) * 2;
            }
        }
        int locat = 0;
        double min;
        int[][] nig_addr = new int[len][num_k];
        int[][] nig_addr2 = new int[len][num_k];
        for (int i = 0; i < len; i++) {
            for (int m = 0; m < num_k; m++) {
                min = Double.POSITIVE_INFINITY;
                for (int j = 0; j < len; j++) {
                    if (dis_matrix[i][j] < min && dis_matrix[i][j] != 0) {
                        min = dis_matrix[i][j];
                        locat = j;
                    }
                }
                nig_addr2[i][m] = nig_addr[i][m] = locat;
                dis_matrix[i][locat] = 0;
            }
        }

        Random random = new Random();
        File file1 = new File(newFilePath);
        FileOutputStream fileOutputStream = null;
        if (!file1.exists()) {
            try {
                file1.createNewFile();
            } catch (IOException e) {
                e.printStackTrace();
            }
        }
        try {
            fileOutputStream = new FileOutputStream(file1, true);
            for (int i = 0; i < len; i++) {
                for (int j = 0; j < num_rate; j++) {
                    StringBuilder stringBuffer = new StringBuilder();
                    stringBuffer.append(1).append(" ");
                    int p1 = i;
                    int p2;
                    int p2_index1 = random.nextInt(num_k);
                    while (nig_addr2[i][p2_index1] == len) {
                        p2_index1 = random.nextInt(num_k);
                    }
                    nig_addr2[i][p2_index1] = len;
                    p2 = nig_addr[i][p2_index1];
                    int[] newFeature = find.union(min_orignal[p1], min_orignal[p2]);
                    int[] intersec = find.intersect(min_orignal[p1], min_orignal[p2]);
                    for (int n = 0; n < newFeature.length; n++) {
                        if (n == (newFeature.length - 1)) {
                            System.out.println(newFeature[n]);
                            stringBuffer.append(newFeature[n]).append(":").append(0).append(" ");
                        } else if (ArrayUtils.contains(intersec, newFeature[n])) {
                            stringBuffer.append(newFeature[n]).append(":").append(1).append(" ");
                        } else {
                            stringBuffer.append(newFeature[n]).append(":").append(Math.random()).append(" ");
                        }
                    }
                    stringBuffer.append("\n");
                    fileOutputStream.write(stringBuffer.toString().getBytes("utf-8"));
                }
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
        // integrate two files into one file
        try {
            FileReader fr1 = new FileReader(filePath);
            FileReader fr2 = new FileReader(newFilePath);
            FileReader fr3 = new FileReader(other_file);
            BufferedReader br1 = new BufferedReader(fr1);
            BufferedReader br2 = new BufferedReader(fr2);
            BufferedReader br3 = new BufferedReader(fr3);

            File filepathfinal = new File(filePathFinal);
            FileOutputStream fileOutputStream1 = null;
            fileOutputStream1 = new FileOutputStream(filepathfinal, true);
            String s2;
            String s1;
            String s3;
            s1 = br1.readLine();
            s2 = br2.readLine();
            s3 = br3.readLine();
            while (s1 != null) {
                s1 = s1 + "\n";
                fileOutputStream1.write(s1.getBytes("utf-8"));
                s1 = br1.readLine();
            }
            while (s2 != null) {
                s2 = s2 + "\n";
                fileOutputStream1.write(s2.getBytes("utf-8"));
                s2 = br2.readLine();

            }
            while (s3 != null) {
                s3 = s3 + "\n";
                fileOutputStream1.write(s3.getBytes("utf-8"));
                s3 = br3.readLine();
            }
            br1.close();
            br2.close();
            System.out.println("combining files is successful...");
            fileOutputStream1.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
        try {
            FileOutputStream fileOutputStream2 = null;
            File fileDATA = new File(final_DATA);
            fileOutputStream2 = new FileOutputStream(fileDATA, true);
            String uri = filePathFinal;
            List<String> list = new ArrayList<String>();
            FileReader finalFile= new FileReader(uri);
            BufferedReader br = new BufferedReader(finalFile);
            String str1;
            while ((str1=br.readLine()) != null) {
                list.add(str1);
            }
            Collections.shuffle(list);
            for (int p = 0; p < list.size(); p++){
                String s  = list.get(p) +  "\n";
                fileOutputStream2.write(s.getBytes("utf-8"));//换行
            }
            File newFile1 = new File(filePathFinal);
            newFile1.delete();
            File newFile = new File(newFilePath);
            newFile.delete();
            fileOutputStream2.close();
        } catch (IOException e) {
            e.printStackTrace();
        }
    }
}