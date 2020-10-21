import os
import random
from pathlib import Path

import utils


def get_training_set(folds, k_valid, k_test, num_folds):
    train_set = []
    for k in range(num_folds):
        if k not in [k_valid, k_test]:
            train_set.extend(folds[k])
    return train_set


def random_split_bugs(all_bugs, num_folds):
    random.seed(7653645160)

    random.shuffle(all_bugs)

    num_bugs = len(all_bugs)
    fold_size = int(num_bugs / num_folds)
    remainder = num_bugs % num_folds

    folds = []

    prev_end = 0
    for k in range(1, num_folds + 1):
        ini = prev_end
        end = prev_end + fold_size
        if remainder > 0:
            end = end + 1
            remainder = remainder - 1
        # if k == num_folds:
        #     end = num_bugs
        folds.append(all_bugs[ini:end])

        prev_end = end

    train_sets = []
    valid_sets = []
    test_sets = []
    for k in range(num_folds):
        k_valid = k
        k_test = (k + 1) % num_folds

        valid_sets.append(folds[k_valid])
        test_sets.append(folds[k_test])
        train_sets.append(get_training_set(folds, k_valid, k_test, num_folds))

    return train_sets, valid_sets, test_sets


def write_sets(sys_output_path, train_sets, valid_sets, test_sets):
    num_sets = len(train_sets)

    for k in range(num_sets):
        utils.write_json_line_by_line(train_sets[k], os.path.join(sys_output_path, f"train_{k}.json"))
        utils.write_json_line_by_line(valid_sets[k], os.path.join(sys_output_path, f"valid_{k}.json"))
        utils.write_json_line_by_line(test_sets[k], os.path.join(sys_output_path, f"test_{k}.json"))


def print_stats(train_sets, valid_sets, test_sets):
    num_sets = len(train_sets)

    for k in range(num_sets):
        num_train = len(train_sets[k])
        num_valid = len(valid_sets[k])
        num_test = len(test_sets[k])
        total = num_train + num_valid + num_test
        print(f"k: {k} -> num_train: {num_train}, num_valid: {num_valid}, num_test: {num_test}, total: {total}")


def check_sets(valid_sets, test_sets):
    num_sets = len(valid_sets)

    for k in range(num_sets):

        set1 = set(bug["id"] for bug in valid_sets[k])
        set2 = set(bug["id"] for bug in valid_sets[(k + 1) % num_sets])
        if set1 & set2:
            raise Exception(f"Validation elements in common in fold: {k}")

        set1 = set(bug["id"] for bug in test_sets[k])
        set2 = set(bug["id"] for bug in test_sets[(k + 1) % num_sets])
        if set1 & set2:
            raise Exception(f"Testing elements in common in fold: {k}")


if __name__ == '__main__':
    data_path = "data_prep3"
    output_path = "data_split3"
    num_folds = 10

    for file in utils.find_file("*.json.prep", data_path):
        sys_name = os.path.basename(file).replace(".json.prep", "")
        all_bugs = utils.read_json_line_by_line(os.path.join(data_path, os.path.basename(file)))

        print(sys_name, len(all_bugs))
        train_sets, valid_sets, test_sets = random_split_bugs(all_bugs, num_folds)

        check_sets(valid_sets, test_sets)
        print_stats(train_sets, valid_sets, test_sets)

        sys_output_path = os.path.join(output_path, sys_name)
        Path(sys_output_path).mkdir(parents=True, exist_ok=True)
        write_sets(sys_output_path, train_sets, valid_sets, test_sets)
