Evaluation:

We evaluate svm models by performing 10-fold cross validation. The dataset contains 116084 sentences in total. We randomly partitioned the data into 10 equal folds, the ratio of training set, validation set and testing set = 8 : 1 : 1.

We only use SMOTE to upsample train set, use validation set for SVM parameter tuning, and finaly test our models on test set.

We use precision/recall to evaluate OB, EB, S2R model performances. From <a href="https://github.com/sea-lab-wm/bee-tool/tree/master/evaluation/results">here</a>, you can see sentence classificaion results and detecting incomplete bug report result. 






