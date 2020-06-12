<p align="center">
  <img src="https://i.ibb.co/6bTfSwp/bee-icon.png?s=128&v=4" width="64">
  <h3 align="center">Add to your repository now: <a href="https://github.com/apps/bee-tool">bee[bot]</a></h3>
  <p align="center">BEE (Bug rEport analyzEr), a GitHub app for structuring and analyzing bug reports. <p> 
  </p>
</p>

## What is BEE?
BEE is a Github app that can help developers structure and analyze bug reports. BEE utilizes machine learning to (i) detect the structure of bug descriptions by automatically labeling each sentencethat corresponds to OB, EB, or S2R; and(ii) alert reporters whentheir bug reports are missing important information. 

![](https://j.gifs.com/QnxpvG.gif)

## What can I do with BEE?
Automatically labeling bug reports can help you 
BEE can automatically label your issue as either bug, question or enhancement. If this issue is labeled as a bug report, BEE labels each sentence as Obsesrved behavior<img src="https://i.ibb.co/1G7bXhB/ob2.png" width="14" title="Observed Behavior (OB)"/>, Expected behavior<img src="https://i.ibb.co/mBgChsk/eb3.png" width="14" title="Expected Behavior (EB)"/>, or Steps to reproduce<img src="https://i.ibb.co/yWS7XhR/s2r2.png" width="14" title="Steps to Reproduce (S2R) ">. BEE will also alert you if there is something missing in your bug report. 

## How do I use BEE?
Using **BEE** is really simple. Once you've installed it in your repository, simply commit an issue, BEE would analyze your issue and create new comments:
## Configuring for your project
Prerequisites:
 - you need to install nodejs-v8.3.x. and npm to compile/install dependencies
 - you need to register a Github App of your own and install it on any repositories


Environment variables:
 - create a .env file in the src folder:
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
Note: refer <a href="https://developer.github.com/apps/building-github-apps/"> Building GitHub Apps</a>
## Set up:
```sh
git clone https://github.com/ysong10/bee-tool.git bee-tool
cd bee-tool

# Install dependencies
npm install

# run server
npm start
```
## How can I contribute to BEE?



