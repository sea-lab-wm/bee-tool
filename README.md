<p align="center">
  <img src="https://i.ibb.co/6bTfSwp/bee-icon.png?s=128&v=4" width="80"> <img src= "https://i.ibb.co/BgSyBhY/bee-tool.png" width="100">
  <p align="center">BEE (Bug rEport analyzEr), a GitHub app for structuring and analyzing bug reports. <p> 
  </p>
</p>

## What is BEE?
BEE is a Github app that can structure and analyze bug reports using machine learning techniques. BEE can automatically label your issue as either bug, question or enhancement. If this issue is labeled as a bug report, BEE labels each sentence as _obsesrved behavior_ <img src="https://i.ibb.co/1G7bXhB/ob2.png" width="14" title="Observed Behavior (OB)"/>, _expected behavior_ <img src="https://i.ibb.co/mBgChsk/eb3.png" width="14" title="Expected Behavior (EB)"/>, or _steps to reproduce_ <img src="https://i.ibb.co/yWS7XhR/s2r2.png" width="14" title="Steps to Reproduce (S2R) ">. BEE will also alert you if there is something missing in your bug report. Here is a screen recording of the BEE in action:

![](https://j.gifs.com/QnxpvG.gif)

## What can I do with BEE?
Automatically labeling bug reports can make your report more clear and readable which help develpoers better understand and fix bugs. Also, BEE can alert you if your bug report is missing key points. A clear and complete bug report can make engineers love you :grin:.

## How do I use BEE?
Using **BEE** is really simple. Add to your repository now ! <a href="https://github.com/apps/bee-tool/"> bee-tool</a>. Once you've installed it in your repository, simply commit an issue, BEE would analyze your issue and create new comments.

## How to configure for my project?
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



[![License: MIT](https://img.shields.io/badge/License-MIT-darkgreen.svg)](https://opensource.org/licenses/MIT)
[![Install App](https://img.shields.io/badge/GitHub%20Marketplace-Install%20App-blueviolet.svg?logo=github)](https://github.com/apps/bee-tool)


