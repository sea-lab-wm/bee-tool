<p align="center">
  <img src="https://i.ibb.co/6bTfSwp/bee-icon.png?s=128&v=4" width="64">
  <h3 align="center">Add to your repository now: <a href="https://github.com/ysong10/bee-tool">bee[bot]</a></h3>
  <p align="center">BEE (Bug rEport analyzEr), a GitHub app for structuring and analyzing bug reports. <p> 
  </p>
</p>

## Usage
Using **BEE** is really simple. Once you've installed it in your repository, simply commit an issue, BEE would analyze your issue and create new comments: 
![](file:///Users/yangsong/Downloads/ezgif.com-optimize.gif)

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

## References
 - The approach behind BEE and evaluation is described in this  <a href="https://developer.github.com/apps/building-github-apps/"> paper <a>. 



