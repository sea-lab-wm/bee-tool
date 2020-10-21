import os
import traceback
from pathlib import Path

import fasttext

import eval_commons as eval
import utils


def compute_metrics(predictions, by_system, label):
    metrics = {}

    overall = "overall"
    if overall not in metrics:
        eval.initilize_metrics(metrics, overall)

    for pred in predictions:

        grnd_trh_labels = eval.get_grnd_trh_labels(pred[0]["labels"])
        pred_labels = eval.get_predicted_labels(pred[1][0])

        # --------------------------

        if by_system:
            system = pred[0]["system"]

            if system not in metrics:
                eval.initilize_metrics(metrics, system)
            eval.increment_base_metrics(metrics[system], label, pred_labels, grnd_trh_labels)

        eval.increment_base_metrics(metrics[overall], label, pred_labels, grnd_trh_labels)

    eval.compute_additional_metrics(metrics)

    return metrics


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

    eval.compute_additional_metrics(aggr_metrics)

    aggr_metrics_list = eval.convert_metrics_to_list(aggr_metrics)
    return aggr_metrics, aggr_metrics_list


if __name__ == '__main__':


    data_path = "data_split_ft_all3"
    output_path = f"results_single3"
    models_path = f"models_single3"

    num_threads = 24
    num_folds = 10

    # num_threads = 12
    # num_folds = 10

    Path(output_path).mkdir(parents=True, exist_ok=True)
    Path(models_path).mkdir(parents=True, exist_ok=True)


    lrs = [0.1, 0.3, 0.5, 0.7, 0.9]
    epochs = [10]
    #epochs = [10, 50]
    #ngrams = [1, 3]
    ngrams = [1]
    dims = [50, 100]
    loss_fns = ["ns", "hs", "softmax", "ova"]

    # lrs = [0.5]
    # epochs = [50]
    # ngrams = [1]
    # dims = [100]
    # loss_fns = ["ns"]


    #labels = ["ob"]
    labels = ["ob", "eb", "s2r"]

    for label in labels:

        print("Processing label", label)

        fold_results = []
        fold_confs = []

        for fold in range(num_folds):

            print("fold: ", fold)

            valid_path = f"valid_{fold}.json.prep"
            test_path = f"test_{fold}.json.prep"

            train_path_ft = f"train_{fold}.json.{label}.prep.ft"
            valid_path_ft = f"valid_{fold}.json.{label}.prep.ft"
            test_path_ft = f"test_{fold}.json.{label}.prep.ft"

            valid_sentences = utils.read_json_line_by_line(os.path.join(data_path, valid_path))
            test_sentences = utils.read_json_line_by_line(os.path.join(data_path, test_path))

            # models_results = {}
            best_result = {
                "conf": None,
                "model": None,
                "aggr_metrics": {"overall": {"f1": 0.0}}
            }
            for lr in lrs:
                for epoch in epochs:
                    for ngram in ngrams:
                        for dim in dims:
                            for loss_fn in loss_fns:

                                conf = [lr, epoch, ngram, dim, loss_fn]
                                print(conf)
                                try:
                                    model = fasttext.train_supervised(input=os.path.join(data_path, train_path_ft),
                                                                      thread=num_threads,
                                                                      lr=lr, epoch=epoch, wordNgrams=ngram, dim=dim,
                                                                      loss=loss_fn)
                                    predictions = list(map(lambda x: (x, model.predict(x["prep_text"])), valid_sentences))
                                    metrics = compute_metrics(predictions, False, label)

                                    if metrics["overall"]["f1"] > best_result["aggr_metrics"]["overall"]["f1"]:
                                        model_results = {
                                            "conf": conf,
                                            "model": model,
                                            "aggr_metrics": metrics
                                        }
                                        best_result = model_results
                                except Exception as e:
                                    print(f"Error for fold={fold} and conf {conf}: {e}")
                                    traceback.print_exc()

            print("best", best_result["aggr_metrics"])

            best_model = best_result["model"]

            predictions = list(map(lambda x: (x, best_model.predict(x["prep_text"])), test_sentences))
            metrics = compute_metrics(predictions, True, label)

            eval.write_results(eval.convert_metrics_to_list(metrics),
                               os.path.join(output_path, f'{label}_results_{fold}.csv'))

            fold_results.append(metrics)
            fold_confs.append(best_result)

            # perfl = best_model.test_label(os.path.join(data_path, test_path_ft))
            # print(perfl)
            # print(metrics["overall"])

        # ---------------------

        best_configs_path = os.path.join(models_path, f'{label}_best_configs.txt')
        if os.path.exists(best_configs_path):
            os.remove(best_configs_path)

        for fold in range(num_folds):
            best_conf = fold_confs[fold]
            print(best_conf)
            best_conf["model"].save_model(os.path.join(models_path, f'{label}_best_model_{fold}.bin'))
            with open(best_configs_path, 'a') as f:
                print(str(fold) + ": ", end='', file=f)
                print(best_conf["conf"], file=f)

        _, all_results_list = get_overall_aggregate_metrics(fold_results)

        eval.write_results(all_results_list, os.path.join(output_path, f'{label}_results.csv'))
