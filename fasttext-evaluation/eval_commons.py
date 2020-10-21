import json
import statistics

import pandas


def initilize_metrics(metrics, system):
    metrics[system] = {
        "tp": 0,
        "fp": 0,
        "tn": 0,
        "fn": 0
    }


def get_predicted_labels(label):
    pred_labels = {label[0].replace("__label__", "")}
    return pred_labels


def get_grnd_trh_labels(labels):
    grnd_trh_labels = set()

    if labels[0].strip() != "":
        grnd_trh_labels.add("ob")

    if labels[1].strip() != "":
        grnd_trh_labels.add("eb")

    if labels[2].strip() != "":
        grnd_trh_labels.add("s2r")

    return grnd_trh_labels


def increment_base_metrics(sys_metrics, label, pred_labels, grnd_trh_labels):
    if label in pred_labels:
        # positive
        if label in grnd_trh_labels:
            # true positive
            sys_metrics["tp"] += 1
        else:
            # false positive
            sys_metrics["fp"] += 1
    else:
        # negative
        if label in grnd_trh_labels:
            # false negative
            sys_metrics["fn"] += 1
        else:
            # true negative
            sys_metrics["tn"] += 1


def compute_evaluation_metrics(metrics):
    tp = metrics["tp"]
    fp = metrics["fp"]
    tn = metrics["tn"]
    fn = metrics["fn"]

    total = tp + fp + tn + fn
    accuracy = (tp + tn) / total

    positives_pred = tp + fp
    precision = 0 if positives_pred == 0 else tp / positives_pred

    positives_gt = tp + metrics["fn"]
    recall = 0 if positives_gt == 0 else tp / positives_gt
    f1 = statistics.harmonic_mean([precision, recall])

    metrics["total"] = total
    metrics["accuracy"] = accuracy
    metrics["precision"] = precision
    metrics["recall"] = recall
    metrics["f1"] = f1


def compute_additional_metrics(sys_metrics):
    for _, metrics in sys_metrics.items():
        compute_evaluation_metrics(metrics)


def convert_metrics_to_list(metrics):
    aggr_metrics_list = []
    for key, value in metrics.items():
        value["system"] = key
        aggr_metrics_list.append(value)
    return aggr_metrics_list


def write_results(data_list, path):
    pandas.read_json(json.dumps(data_list)).to_csv(path, index=False, sep=";")
