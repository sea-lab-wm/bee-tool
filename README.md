<p align="center"> <img src="https://i.ibb.co/6bTfSwp/bee-icon.png?s=128&v=4" width="100"> 
     <p align="center"> <img src= "https://i.ibb.co/tCLWKjk/bee-tool.png" width="300"></p>
</p>


[![License: MIT](https://img.shields.io/badge/License-MIT-darkgreen.svg)](https://opensource.org/licenses/MIT)
[![Install App](https://img.shields.io/badge/GitHub%20Marketplace-Install%20App-blueviolet.svg?logo=github)](https://github.com/apps/bee-tool)

## What is BEE?
BEE is a Github app that automatically analyzes user-written bug reports and provides feedback to reporters and developers about if their bug reports provide the following important information: the _obsesrved behavior_ <img src="https://i.ibb.co/1G7bXhB/ob2.png" width="14" title="Observed Behavior (OB)"/>, _expected behavior_ <img src="https://i.ibb.co/mBgChsk/eb3.png" width="14" title="Expected Behavior (EB)"/>, or _steps to reproduce_ <img src="https://i.ibb.co/yWS7XhR/s2r2.png" width="14" title="Steps to Reproduce (S2R) ">. BEE utilizes meaching learning techniques to (1) detect if an issue describes a bug, an enhancement, or a question. For bug reports, BEE can automatically identify the structure of bug descriptions by labeling the sentences that correspond to the OB, EB, or S2R; and (2) detect when bug reports fail to provide these elements. BEE adds comments and label to the bug report to alert reporters about missing elements so that they can provide the information timely. Bee offers a public web API for the automated identification of the OB, EB, and S2R in textual documents. Users can send API requests containing any piece of text, Bee parses the text into sentences and returns them to the user, each one marked as OB, EB, and/or S2R. Here is a screen recording of the BEE in action:

![](https://github.com/ysong10/bee-tool/blob/master/bee-tool.gif)     

## Why do I need BEE?
Bug reports are essential in helping developers triage, replicate, locate, and fix the bugs in the software
From the information reporters provide in bug reports, the system’s _observed (unexpected) behavior_ (OB), the steps to reproduce (S2R) the bug, and the software expected behavior (EB) are among the most important elements for developers. These elements are typically expressed by end-users or developers in natural language through issue trackers. While these elements are highly important, they are often incomplete, unclear, or not provided at all by the reporters on GitHub. The consequence of this is that developers often spend too much effort triaging and fixing the problems. One of the main reasons for having low-quality bug reports is GitHub lacks feedback and quality verification of issue trackers. So BEE is developed to solve this problem by providing feedbacks to reporters and developers about the OB, EB, and S2R. Automatically labeling bug reports can make your report more clear and readable which help develpoers better understand and fix bugs. 

## How do I use BEE?
Using **BEE** is really simple. Add to your repository now ! <a href="https://github.com/apps/bee-tool/"> bee-tool</a>. Once you've installed it in your repository, simply commit an issue, BEE would analyze your issue. 
 1. the first step of the tool, right after an issue is submitted, is to automatically check if the issue describes a bug, as opposed to a feature, enhancement, or question. If the issue is classified as bug report, Bee tags the issue with the label "bug" and proceeds with following analysis of the bug report, otherwise, BEE would not proceed the following analysis.
 2. Bee analyzes the title and description of a bug report, focusing on the OB, EB, S2R. Bee can detect when any of these elements is not provided by the reporter. In that case, Bee makes a comment in the issue, alerting the reporter about the missing information and asking him/her to provide the information. 
 3. Bee assigns the issue to the reporter and tags the issue with the label info-needed.
 4. If all the three elements are provided by the user, Bee makes a comment indicating the bug report appears to be complete.
 5. Finally, Bee provides additional feedback by structuring the bug description which contains the bug title and description as provided in the original issue (with the same format), but with the sentences labeled as OB , EB , or S2R.

Besides, Bee offers a public web API for the automated identification of the OB, EB, and S2R in textual documents. Users can send API requests that contain any piece of text. All data is sent and received as JSON. BEE  parses the text into sentences and returns them to the user, each one marked as OB, EB, and/or S2R in a JSON file.
## How does BEE work?
 - **Issue classification**  For classifying issues, Bee relies on <a href="https://fasttext.cc/"> fastText </a>.  The model is a multi-class linear neural model that receives the set of n-grams extracted from the issue title and description.
 - **Sentence classification**  Bee extracts {1,2,3}-grams and {1,2,3}-POS tags that are extracted from each sentence using tokenization, lemmatization, and POS tagging via  <a href="https://stanfordnlp.github.io/CoreNLP/history.html"> Stanford CoreNLP library </a>. The input for each sentence is a binary vector that each component of the vector corresponds to an n-gram or a POS tag and takes the value one if the sentence contains the component, and the value zero otherwise. 
 - **Prediction models** we use linear Support Vector Machines (SVMs) for classifying the sentences. Bee implements three binary SVMs, one for each of the information types (OB, EB, S2R). 
 - **Architecture** Here is a sequence diagram of BEE:
  <p align="center"> <img src= "https://i.ibb.co/QrJJvKv/Figure2.png" width="300"></p>
  
## How do I run the code on my server?
Prerequisites:
 - you need to install nodejs-v8.3.x. and npm to compile/install dependencies
 - you need to register a Github App of your own and install it on any repositories

Then, clone the repo:
```sh
git clone https://github.com/ysong10/bee-tool.git bee-tool
cd bee-tool
```
Create a .env file in the src folder and set the right environment variables as <a href="https://developer.github.com/apps/building-github-apps/"> Building GitHub Apps</a>
 ```
GITHUB_APP_ID = xxxxx
GITHUB_PRIVATE_KEY = "-----BEGIN RSA PRIVATE KEY-----
...
HkVN9...
...
-----BEGIN RSA PRIVATE KEY-----"
GITHUB_WEBHOOK_SECRET = xxx (optional)
PORT = xxxx
```

Download <a href="https://stanfordnlp.github.io/CoreNLP/history.html"> Stanford CoreNLP 3.9.0 </a>. To connect your Nodejs application to Stanford CoreNLP:
```sh
# Run the server using all jars in the current directory (e.g., the CoreNLP home directory), 
java -mx4g -cp "*" edu.stanford.nlp.pipeline.StanfordCoreNLPServer -port 9000 -timeout 15000
```
CoreNLP connects by default via StanfordCoreNLPServer, using port 9000. You can also opt to setup the connection differently.

Now, install app dependencies and run it:
```sh
# Install dependencies
npm install

# run server
npm start
```
## How do I contribute to BEE?





