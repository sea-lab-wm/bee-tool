<p align="center"> <img src="designs/icons/bee-icon.png" width="150"></p>
<p align="center"> <img src= "designs/icons/bee-name.PNG" width="300"></p>


[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)
[![Install App](https://img.shields.io/badge/GitHub%20App-Install-blueviolet?logo=github)](https://github.com/apps/bee-tool)

## What is BEE?

BEE is an open-source GitHub app that analyzes the issues that users submit to GitHub repositories. BEE supports issues written in any form, any format, and for any software system. 

BEE focuses on analyzing three elements in bug reports (i.e., issues that describe software bugs):
* The system's observed (unexpected) behavior (**OB**)
* The system's expected behavior (**EB**)
* The steps to reproduce the bug (**S2R**)

## What are BEE's features?

BEE provides three main features:
* Detect the type of an issue: a bug report, an enhancement, or a question
* Detect when the OB, EB, and/or S2R are not provided by the user in their bug reports.
* Structure bug descriptions, by identifying and labeling the sentences that describe the OB, EB, and/or S2R

BEE can be installed as an GitHub app on any GitHub repository.
BEE also offers a public web API for identification of the OB, EB, and S2R in any piece of text

A video demonstration of BEE can found <a href="https://youtu.be/W3_YqsfeAUo">here</a>.

<p align="center"> <img src="designs/images/bee-tool.gif" width="900"></p>

## Why do I need BEE?

BEE is meant to help users provide better bug reports, increase the productivity of developers, and help researchers in their investigations.

As a developer, you can use BEE to:
1. prioritize and manage incoming issues in your software projects
2. check whether bug reports are complete or incomplete
3. prompt reporters to provide the missing information when bug reports are incomplete
4. easily understand and spot the main elements in bug descriptions (the OB, EB, and S2R)
5. automate issue/bug report analysis or develop new tools using BEE's web API

As a researcher, you can use BEE's web API to investigate bug descriptions and to automate tasks that rely on them, such as bug reproduction, localization, duplicate detection, bug report quality assessment, etc.

## How do I use BEE?

Using BEE is simple. All you need to do is adding BEE to your GitHub repositories by following <a href="https://github.com/apps/bee-tool/">this link</a>. Once installed, BEE will analyze any incoming issue within your repositories.

Besides, you can use BEE's web API in your script, app, or tool, by sending an HTTP POST request to `http://bugreportchecker.ngrok.io/api`, in the following format:
```json
{
   "text":"I experienced a crash when opening the settings menu"
}
```

The API would return a response with the sentences labeled as OB, EB, and/or S2R if they convey these elements:
```json
{
   "code":200,
   "status":"success",
   "bug_report":{
      "0":{
         "text":"I experienced a crash when opening the settings menu",
         "labels":[
            "OB",
            "S2R"
         ]
      }
   }
}
```

## How does BEE work?

BEE is implemented using <a href="https://nodejs.org/">Node.js</a>, under the following architecture:
<p align="center"> <img src="designs/images/architecture.png" width="900"></p>

The main components of BEE are the following:
* GitHub Controller: it handles the communication with GitHub and controls how other BEE components interact.
* Web API Controller: it is the web interface and controller of BEE's API.
* Issue Classifier: it classifies a GitHub issue as a bug, an enhancement, or a question. The classifier is a multi-class linear neural model based on <a href="https://fasttext.cc/">fastText</a>.
* Sentence Classifier: it classifies each sentence of a bug report as OB, EB, or S2R (i.e., the sentence describes any of these elements. Three binary Support Vector Machines (SVMs) implemented on <a href="http://svmlight.joachims.org/">SVM <i><sup>light</sup></i></a> are used for sentence classification. The <a href="https://stanfordnlp.github.io/CoreNLP/history.html">Stanford CoreNLP</a> library is used to preprocess the bug report. 
* Missing Elements Detector: based on sentence classification, it detects if a bug report lacks the OB, EB, and S2R.

## How can I contribute to BEE?

We are more than happy to receive your contributions (any kind of contributions). If you have an idea of a feature or enhancement, or if you find a bug, please open an issue (or a pull request). If you have questions, feel free to contact us: <a href="https://ysong10.github.io/">Yang Song</a> (ysong10 at email.wm.edu) & <a href="http://ojcchar.github.io/">Oscar Chaparro</a> (oscarch at wm.edu)
  
## How do I customize and run BEE on my server?

First, fork the repository and make sure you:
 - install nodejs-v8.3.x. and npm to compile/install dependencies
 - create and register a Github App of your own and install it in your repositories

After cloning the forked repo, create a .env file in the src folder and set the right environment variables as described  <a href="https://developer.github.com/apps/building-github-apps/">here</a>. This is the format of the file:
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

Download <a href="https://stanfordnlp.github.io/CoreNLP/history.html">Stanford CoreNLP 3.9.0</a> and run the server it provides:
```sh
# Run the server using all jars in the current directory (e.g., the CoreNLP home directory), 
java -mx4g -cp "*" edu.stanford.nlp.pipeline.StanfordCoreNLPServer -port 9000 -timeout 15000
```
CoreNLP connects by default via StanfordCoreNLPServer, using port 9000. You can use a different port if you want.

Install the dependencies and run the app:
```sh
# Install dependencies
npm install

# Run the app server
npm start
```

You may need to use `ngrok` to expose your app to the Internet (see <a href="https://developer.github.com/webhooks/configuring/">this article</a> from information).

Note: the binary files for OB, EB, and S2R in ```/github-app/models``` can be executed on Linux(64-bit). If you want to 
run it on other systems, you can download the binaries from  <a href="http://svmlight.joachims.org//">here</a>, and then train your own OB, EB, and S2R models. 
## Who develops BEE?

BEE is developed by <a href="https://ysong10.github.io/">Yang Song</a> and <a href="http://ojcchar.github.io/">Oscar Chaparro</a> from the College of William & Mary.
