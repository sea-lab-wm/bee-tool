import csv
import fnmatch
import json
import ntpath
import os

import pandas as pd
from itertools import groupby

def write_json(data, file_path, pretty_printing):
    indent = -1
    if pretty_printing:
        indent = 2
    with open(file_path, 'w') as dest_file:
        print(json.dumps(data, indent=indent), file=dest_file)


def write_json_line_by_line(data, file_path):
    with open(file_path, 'w') as dest_file:
        for record in data:
            print(json.dumps(record, sort_keys=True), file=dest_file)


def read_csv_to_dic_list(file_path):
    data = []
    with open(file_path, encoding="utf-8") as csv_file:
        csv_reader = csv.DictReader(csv_file, delimiter=';')
        for item in csv_reader:
            # yield {str(key, 'utf-8'):str(value, 'utf-8') for key, value in item}
            data.append(item)
    return data


def read_json(file_path):
    with open(file_path, encoding="utf-8") as file:
        return json.load(file)


def read_json_line_by_line(file_path):
    data = []
    with open(file_path, encoding="utf-8") as sett_file:
        for item in map(json.loads, sett_file):
            data.append(item)
    return data


def find_file(pattern, path):
    result = []
    for root, dirs, files in os.walk(path):
        for name in files:
            if fnmatch.fnmatch(name, pattern):
                result.append(os.path.join(root, name))
    return result


def write_list_to_file(data, file_path):
    with open(file_path, 'w', encoding="utf-8") as file:
        for x in data:
            file.write("{}\n".format(x))


def write_csv_from_json_list(data, output_path):
    pd.read_json(json.dumps(data)).to_csv(output_path, index=False, sep=";")


def group_dict(data, lambda_expr):
    result = {}
    data.sort(key=lambda_expr)
    for k, v in groupby(data, key=lambda_expr):
        result[k] = list(v)
    return result


def load_settings(path):
    settings_files = find_file("*.json", path)

    all_settings = {}
    for file_path in settings_files:
        setting_name = ntpath.basename(file_path).split(".")[0]
        all_settings[setting_name] = []
        with open(file_path) as sett_file:
            for retrieval_run in map(json.loads, sett_file):
                all_settings[setting_name].append(retrieval_run)

    return all_settings

def get_system_name(sys_url):
    return sys_url[sys_url.index("/") + 1:len(sys_url)]



def has_bug_labels(bug_report, sys_bug_labels):
    labels = bug_report["labels"]
    return contains_one_label(labels, sys_bug_labels)


def contains_one_label(label_list, sys_bug_labels):
    # if empty, we assume the issue is a bug
    if not sys_bug_labels:
        return True
    else:
        for label in label_list:
            for sys_label in sys_bug_labels:
                if sys_label.lower() in label.lower():
                    return True
    return False