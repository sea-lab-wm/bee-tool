#!/usr/bin/env python
import os
import subprocess

def test(dirname, k_splits):
    """
    split the dataset into k folds
    :param pathname: the dataset
    :param k_splits:
    :return: the number of folds
    """
    resultpath = result + dirname + ".txt"
    myResults = open(resultpath,'a')
    k = 0
    while k < k_splits :
        testpath = "/home/yang/Documents/BUG_REPORT/" + dirname + "/test" + str(k) + '.dat'
        modelpath = "/home/yang/Documents/BUG_REPORT/"  + dirname +  "/model" + str(k) + '.txt'
        predictionpath =  "/home/yang/Documents/BUG_REPORT/"+ dirname + "/prediction" + str(k) +".txt"
        a = open(predictionpath,'w')
        test = open(testpath,'r')
        model = open(modelpath,'r')
        
        ret = subprocess.Popen(['./svm_classify', '-v','1', testpath, modelpath, predictionpath], stdout=subprocess.PIPE,stderr = subprocess.STDOUT)
        stdout,stderr = ret.communicate()
        myResults.write(stdout.decode('utf-8'))
        myResults.write("\n")
        model.close()
        test.close()
        a.close()
        k = k + 1

    myResults.close()
  
if __name__ == "__main__":
    test("OB_test" ,10)
    test("EB_test" ,10)
    test("SR_test" ,10)





























