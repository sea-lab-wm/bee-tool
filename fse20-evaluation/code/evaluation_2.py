import csv
def getResult(str)
    d = {}
    filename = "finalStat" + str + ".csv"

    with open(filename, 'r', encoding="utf-8") as csv_file:
        csv_reader_lines = csv.reader(csv_file)
        for row in csv_reader_lines:
            id = row[0]
            label = row[1]
            pre = row[2]
            if id not in d:
                d[id] = {'pd': 'non' + str, 'gt': 'non' + str}
                if int(pre) > 0:
                    d.get(id)['pd'] = 'OB'
                if int(label) > 0:
                    d.get(id)['gt'] = 'OB'
            else:
                if int(pre) > 0:
                    d.get(id)['pd'] = 'OB'
                if int(label) > 0:
                    d.get(id)['gt'] = 'OB'
    TP = 0
    FP = 0
    TN = 0
    FN = 0
    for key in d:
        print(key, d.get(key))
        if d.get(key).get('gt') == 'OB' and d.get(key).get('pd') == 'OB':
            TN = TN + 1
        if d.get(key).get('gt') == 'non' + str and d.get(key).get('pd') == 'OB':
            FN = FN + 1
        if d.get(key).get('gt') == 'non' + str and d.get(key).get('pd') == 'non' + str:
            TP = TP + 1
        if d.get(key).get('gt') == 'OB' and d.get(key).get('pd') == 'non' + str:
            FP = FP + 1

        print("\n")

    print(str, TN, FN, TP, FP)

if __name__ == "__main__":
    getResult("OB")
    getResult("EB")
    getResult("SR")
