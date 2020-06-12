import csv
def outputCSV(path):
    
    s = "SR"
    path = 'SR'
    with open("finalstat" + path + ".csv", "w", newline="") as datacsv:
        csvwriter = csv.writer(datacsv, dialect="excel")
        csvwriter.writerow([' ', "FN", "TP", "TN", "FP"])
        for j in range(10):
            for i in range(10):
                TP = 0
                FP = 0
                TN = 0
                FN = 0
                f = open(path + '/' + path + j +  "/test" + str(i) + ".dat", "r")
                lines = f.readlines()
                f1 = open(path + '/' + path + j + "/prediction" + str(i) + ".txt", "r")
                lines1 = f1.readlines()
                if len(lines) == len(lines1):
                    for j in range(len(lines)):
                        va = lines[j]
                        label = va[0:va.index(" ")]
                        pre = lines1[j]
                        if label == "1" and float(pre.replace("\n", "")) < 0:
                            FN = FN + 1
                        if label == "1" and float(pre.replace("\n", "")) > 0:
                            TP = TP + 1
                        if label == "-1" and float(pre.replace("\n", "")) < 0:
                            TN = TN + 1
                        if label == "-1" and float(pre.replace("\n", "")) > 0:
                            FP = FP + 1
                csvwriter.writerow([str(i), FN, TP, TN, FP])

if __name__ == "__main__":
    outputCSV("OB")
    outputCSV("EB")
    outputCSV("SR")