#!/usr/bin/env python
import os
import subprocess
def kfold_split(pathname, k_splits, s):

    """
    split the dataset into k folds
    :param pathname: the dataset
    :param k_splits:
    :return: the number of folds
    """

    f = open(pathname, "r")
    lines = f.readlines()
    dataset_size = len(lines)
    fold_size = dataset_size / k_splits
    resultpath = "result" + s + ".txt"
    myResult = open(resultpath, 'a')
    newdir = "/home/yang/Documents/BUG_REPORT/" + s
    if not os.path.exists(newdir):
       print "path doesn't exist. trying to make"
       os.makedirs(newdir)
    for k in range(1, 11):
        p = str(k/float(10))
        for i in range(k_splits):
            modelpath = "/home/yang/Documents/BUG_REPORT/" + s + "/" + s + str(k) + "/model" + str(i) + ".txt"
            model = open(modelpath,"w")
            testpath = "/home/yang/Documents/BUG_REPORT/" + s + "/" +  s + str(k)+"/test" + str(i) + ".dat"
            test = open(testpath, "w")
            validationpath = "/home/yang/Documents/BUG_REPORT/" + s + "/" + s +  str(k) + "/validation" + str(i) + ".dat"
            validation = open(validationpath,"w")
            train = open("train.dat",'w')
            predictionpath = "/home/yang/Documents/BUG_REPORT/" + s + "/" + s + str(k) + "/prediction" + str(i) + ".txt"
            a = open(predictionpath, 'a')
            if i == 8:
                for j in range(dataset_size):
                    if i * fold_size <= j < (i + 1) * fold_size and lines[j].find(":0.") == -1:
                        test.write(lines[j])
                    elif (i + 1) * fold_size <= j and lines[j].find(":0.") == -1:
                        validation.write(lines[j])
                    else:
                        train.write(lines[j])
            
            elif i == 9:
                for j in range(dataset_size):
                    if i * fold_size <= j and lines[j].find(":0.") == -1:
                        test.write(lines[j])
                    elif (i + 1) % k_splits * fold_size <= j < (i + 2) % k_splits * fold_size and lines[j].find(":0.") == -1:
                        validation.write(lines[j])
                    else:
                        train.write(lines[j])
            else:
                for j in range(dataset_size):
                    if i * fold_size <= j < (i + 1) * fold_size and lines[j].find(":0.") == -1:
                        test.write(lines[j])
                    elif (i + 1) % k_splits * fold_size <= j < (i + 2) % k_splits * fold_size and lines[j].find(":0.") == -1:
                        validation.write(lines[j])
                    else:
                        train.write(lines[j])

            train.close()
            validation.close()
            test.close()
            a.close()
            model.close()
            
            subprocess.call(['./svm_learn', '-t', '0', '-j', p, 'train.dat', modelpath])

            ret = subprocess.Popen(['./svm_classify', '-v', '1', validationpath, modelpath, predictionpath],
                                   stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
            stdout, stderr = ret.communicate()
            myResult.write(stdout.decode('utf-8'))
            myResult.write("\n")
            os.remove("train.dat")
    f.close()
    myResult.close()

if __name__ == "__main__":
    kfold_split("data_OB.dat", 10, 'OB')
    kfold_split("data_EB.dat", 10, 'EB')
    kfold_split("data_SR.dat", 10, 'SR')



