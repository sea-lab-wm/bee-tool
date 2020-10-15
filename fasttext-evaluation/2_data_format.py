import os
from pathlib import Path

import utils


def get_labels(labels):
    class_template = "__label__[ 0 ]"
    classes = []

    if labels[0].strip() != "":
        classes.append(class_template.replace("[ 0 ]", "ob"))

    if labels[1].strip() != "":
        classes.append(class_template.replace("[ 0 ]", "eb"))

    if labels[2].strip() != "":
        classes.append(class_template.replace("[ 0 ]", "s2r"))

    if not classes:
        classes.append(class_template.replace("[ 0 ]", "other"))

    return " ".join(classes)


def add_system(sentence, system):
    sentence["system"] = system
    return sentence


def get_bug_sentences(bugs, system):
    all_sentences = []
    for bug in bugs:
        all_sentences.extend(bug["sentences"])

    all_sentences = list(map(lambda x: add_system(x, system), all_sentences))

    fasttext_sentences = list(map(lambda x: get_labels(x["labels"]) + " " + x["prep_text"], all_sentences))
    return fasttext_sentences, all_sentences


if __name__ == '__main__':
    data_path = "data_split"
    output_path = "data_split_ft"
    num_folds = 10

    for k in range(num_folds):
        print(k)
        for _, dirs, _ in os.walk(data_path):
            fold_ft_sentences = {}
            fold_sentences = {}

            for sys_name in dirs:
                files = utils.find_file(f"*_{k}.json", os.path.join(data_path, sys_name))

                Path(os.path.join(output_path, sys_name)).mkdir(parents=True, exist_ok=True)
                for file in files:
                    bugs = utils.read_json_line_by_line(file)
                    ft_sentences, sentences = get_bug_sentences(bugs, sys_name)

                    basename = os.path.basename(file)
                    if basename not in fold_ft_sentences:
                        fold_ft_sentences[basename] = []
                    fold_ft_sentences[basename].extend(ft_sentences)

                    if basename not in fold_sentences:
                        fold_sentences[basename] = []
                    fold_sentences[basename].extend(sentences)

                    utils.write_list_to_file(ft_sentences,
                                             os.path.join(output_path, sys_name, basename + ".prep.ft"))
                    utils.write_json_line_by_line(sentences,
                                             os.path.join(output_path, sys_name, basename + ".prep"))

            for fold, sentences in fold_ft_sentences.items():
                utils.write_list_to_file(sentences,
                                         os.path.join(output_path, fold + ".prep.ft"))
            for fold, sentences in fold_sentences.items():
                utils.write_json_line_by_line(sentences,
                                         os.path.join(output_path, fold + ".prep"))
