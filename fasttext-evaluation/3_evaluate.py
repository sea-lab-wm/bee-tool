import json
import os
import statistics
from pathlib import Path

import fasttext
import pandas

import utils


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


def compute_metrics(predictions, by_system):
    ob_metrics = {}
    eb_metrics = {}
    s2r_metrics = {}

    overall = "overall"
    if overall not in ob_metrics:
        initilize_metrics(ob_metrics, overall)
    if overall not in eb_metrics:
        initilize_metrics(eb_metrics, overall)
    if overall not in s2r_metrics:
        initilize_metrics(s2r_metrics, overall)

    for pred in predictions:

        grnd_trh_labels = get_grnd_trh_labels(pred[0]["labels"])
        pred_labels = get_predicted_labels(pred[1][0])

        # --------------------------

        if by_system:
            system = pred[0]["system"]

            if system not in ob_metrics:
                initilize_metrics(ob_metrics, system)
            increment_base_metrics(ob_metrics[system], "ob", pred_labels, grnd_trh_labels)

            if system not in eb_metrics:
                initilize_metrics(eb_metrics, system)
            increment_base_metrics(eb_metrics[system], "eb", pred_labels, grnd_trh_labels)

            if system not in s2r_metrics:
                initilize_metrics(s2r_metrics, system)
            increment_base_metrics(s2r_metrics[system], "s2r", pred_labels, grnd_trh_labels)

        increment_base_metrics(ob_metrics[overall], "ob", pred_labels, grnd_trh_labels)
        increment_base_metrics(eb_metrics[overall], "eb", pred_labels, grnd_trh_labels)
        increment_base_metrics(s2r_metrics[overall], "s2r", pred_labels, grnd_trh_labels)

    compute_additional_metrics(ob_metrics)
    compute_additional_metrics(eb_metrics)
    compute_additional_metrics(s2r_metrics)

    return ob_metrics, eb_metrics, s2r_metrics


def get_overall_aggregate_metrics(metric_sets):
    aggr_metrics = {}
    for system in metric_sets[0].keys():
        aggr_metrics[system] = {
            "tp": 0,
            "fp": 0,
            "tn": 0,
            "fn": 0,
        }

    for mtr_set in metric_sets:
        for system, metrics in mtr_set.items():
            aggr_metrics[system]["tp"] += metrics["tp"]
            aggr_metrics[system]["fp"] += metrics["fp"]
            aggr_metrics[system]["tn"] += metrics["tn"]
            aggr_metrics[system]["fn"] += metrics["fn"]

    compute_additional_metrics(aggr_metrics)

    aggr_metrics_list = convert_metrics_to_list(aggr_metrics)
    return aggr_metrics, aggr_metrics_list


def convert_metrics_to_list(metrics):
    aggr_metrics_list = []
    for key, value in metrics.items():
        value["system"] = key
        aggr_metrics_list.append(value)
    return aggr_metrics_list


def write_results(data_list, path):
    pandas.read_json(json.dumps(data_list)).to_csv(path, index=False, sep=";")


if __name__ == '__main__':

    data_path = "data_split_ft"
    output_path = "results"
    models_path = "models"

    num_threads = 12
    num_folds = 1

    Path(output_path).mkdir(parents=True, exist_ok=True)
    Path(models_path).mkdir(parents=True, exist_ok=True)

    fold_results = []
    fold_confs = []

    for fold in range(num_folds):

        print("fold: ", fold)

        valid_path = f"valid_{fold}.json.prep"
        test_path = f"test_{fold}.json.prep"

        train_path_ft = f"train_{fold}.json.prep.ft"
        valid_path_ft = f"valid_{fold}.json.prep.ft"
        test_path_ft = f"test_{fold}.json.prep.ft"

        valid_sentences = utils.read_json_line_by_line(os.path.join(data_path, valid_path))
        test_sentences = utils.read_json_line_by_line(os.path.join(data_path, test_path))

        # lrs = arange(0.1, 1, 0.2)
        # epochs = [10, 50, 100]
        # ngrams = [1, 3, 5]
        # dims = [50, 100, 150]
        # loss_fns = ["ns", "hs", "softmax", "ova"]

        lrs = [0.5]
        epochs = [50]
        ngrams = [3]
        dims = [100]
        loss_fns = ["softmax"]

        # models_results = {}
        best_result = {
            "conf": None,
            "model": None,
            "metrics": None,
            "aggr_metrics": {"overall": {"f1": 0.0}}
        }
        for lr in lrs:
            for epoch in epochs:
                for ngram in ngrams:
                    for dim in dims:
                        for loss_fn in loss_fns:
                            model = fasttext.train_supervised(input=os.path.join(data_path, train_path_ft),
                                                              thread=num_threads,
                                                              lr=lr, epoch=epoch, wordNgrams=ngram, dim=dim,
                                                              loss=loss_fn)
                            predictions = list(map(lambda x: (x, model.predict(x["prep_text"])), valid_sentences))
                            ob_metrics, eb_metrics, s2r_metrics = compute_metrics(predictions, False)
                            aggr_metrics, _ = get_overall_aggregate_metrics([ob_metrics, eb_metrics, s2r_metrics])

                            # models_results[tuple(conf)] = model_results

                            if aggr_metrics["overall"]["f1"] > best_result["aggr_metrics"]["overall"]["f1"]:
                                conf = [lr, epoch, ngram, dim, loss_fn]
                                model_results = {
                                    "conf": conf,
                                    "model": model,
                                    "metrics": [ob_metrics, eb_metrics, s2r_metrics],
                                    "aggr_metrics": aggr_metrics
                                }
                                best_result = model_results
                                # print("new best", best_conf, best_result["aggr_metrics"])

        print("best", best_result["aggr_metrics"])

        best_model = best_result["model"]

        predictions = list(map(lambda x: (x, best_model.predict(x["prep_text"])), test_sentences))
        ob_metrics, eb_metrics, s2r_metrics = compute_metrics(predictions, True)

        aggr_metrics, aggr_metrics_list = get_overall_aggregate_metrics([ob_metrics, eb_metrics, s2r_metrics])

        # print(ob_metrics)
        # print(eb_metrics)
        # print(s2r_metrics)
        #
        # for key, value in aggr_metrics.items():
        #     print(key, value)
        #
        # perfl = best_model.test_label(os.path.join(data_path, test_path_ft))
        # print(perfl)

        write_results(convert_metrics_to_list(ob_metrics), os.path.join(output_path, f'ob_results_{fold}.csv'))
        write_results(convert_metrics_to_list(eb_metrics), os.path.join(output_path, f'eb_results_{fold}.csv'))
        write_results(convert_metrics_to_list(s2r_metrics), os.path.join(output_path, f's2r_results_{fold}.csv'))
        write_results(aggr_metrics_list, os.path.join(output_path, f'all_results_{fold}.csv'))

        fold_results.append([ob_metrics, eb_metrics, s2r_metrics])
        fold_confs.append(best_result)

    # ---------------------

    for fold in range(num_folds):
        best_conf = fold_confs[fold]
        print(best_conf)
        best_conf["model"].save_model(os.path.join(models_path, f'best_model_{fold}.bin'))

    all_ob_results, all_ob_results_list = get_overall_aggregate_metrics(
        list(map(lambda results_fold: results_fold[0], fold_results)))
    all_eb_results, all_eb_results_list = get_overall_aggregate_metrics(
        list(map(lambda results_fold: results_fold[1], fold_results)))
    all_s2r_results, all_s2r_results_list = get_overall_aggregate_metrics(
        list(map(lambda results_fold: results_fold[2], fold_results)))

    aggr_metrics, aggr_metrics_list = get_overall_aggregate_metrics([all_ob_results, all_eb_results, all_s2r_results])

    write_results(all_ob_results_list, os.path.join(output_path, f'ob_results.csv'))
    write_results(all_eb_results_list, os.path.join(output_path, f'eb_results.csv'))
    write_results(all_s2r_results_list, os.path.join(output_path, f's2r_results.csv'))
    write_results(aggr_metrics_list, os.path.join(output_path, f'all_results.csv'))
