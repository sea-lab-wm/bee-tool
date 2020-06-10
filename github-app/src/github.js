"use strict";

const crypto = require("crypto");
const request = require('request');
const jwt = require("jsonwebtoken");
const config = require("./config");
const fs = require("fs");


// GitHub uses the WEBHOOK_SECRET, registered to the GitHub App, to
// create the hash signature sent in the `X-HUB-Signature` header of each
// webhook. This code computes the expected hash signature and compares it to
// the signature sent in the `X-HUB-Signature` header. If they don't match,
// this request is an attack, and you should reject it. GitHub uses the HMAC
// hexdigest to compute the signature. The `X-HUB-Signature` looks something
// like this: "sha1=123456".cd bug
exports.verifySignature = async ({payload, secret, signature}) => {
    const digest = crypto.createHmac("sha1", secret).update(payload).digest("hex");
    const newCreatedSignature  = `sha1=${digest}`;
    return newCreatedSignature === signature;

};

exports.getAccessToken = function(installationId) {
    let options = {
        url: `https://api.github.com/app/installations/${installationId}/access_tokens`,
        method: "POST",
        headers: {
            "Authorization": `Bearer ${makeJwt()}`,
            "Accept": "application/vnd.github.machine-man-preview+json",
            "User-Agent": "bug report checker",
        },
    };
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (!error) {
                resolve(JSON.parse(body)["token"]); //json反序列化
            } else {
                reject(error);
            }

        })
    })
};

exports.setComments1 = function({url, accessToken,comment1}){
    let options = {
        url: `${url}/comments`,
        method: "POST",
        body: JSON.stringify({"body":`${comment1}`}),
        headers:{
            "Authorization": `token ${accessToken}`,
            "Accept": "application/vnd.github.machine-man-preview+json",
            "User-Agent": "bug report checker",
        },
    };
    return new Promise ((resolve,reject) => {
        request(options, (error, response, body) => {
            if (!error) {
                resolve(body);
                //remove the prediction files and input files
                fs.unlink('predictions_OB.txt', (err) => {
                    if (err) throw err;
                    console.log('predictions_EB.txt was deleted');
                });
                fs.unlink('predictions_EB.txt', (err) => {
                    if (err) throw err;
                    console.log('predictions_EB.txt was deleted');
                });
                fs.unlink('predictions_SR.txt', (err) => {
                    if (err) throw err;
                    console.log('predictions_SR.txt was deleted');
                });
                fs.unlink('input.dat', (err) => {
                    if (err) throw err;
                    console.log('input.dat was deleted');
                });
            } else {
                console.log(reject(error));
            }

        })
    })
};
exports.setComments2 = function({url, accessToken,comment2}){
    let options = {
        url: `${url}/comments`,
        method: "POST",
        body: JSON.stringify({"body":`${comment2}`}),
        headers:{
            "Authorization": `token ${accessToken}`,
            "Accept": "application/vnd.github.machine-man-preview+json",
            "User-Agent": "bug report checker",
        },
    };
    return new Promise ((resolve,reject) => {
        request(options, (error, response, body) => {
            if (!error) {
                resolve(body);
                 //remove the prediction files and input files
            } else {
                console.log(reject(error));
            }

        })
    })
};

exports.setLabels = function({url, accessToken, prediction}) {
    let options = {
        url: `${url}/labels`,
        method: "POST",
        body: JSON.stringify({"labels":[`${prediction}`]}),
        headers: {
            "Authorization": `token ${accessToken}`,
            "Accept": "application/vnd.github.machine-man-preview+json",
            "User-Agent": "bug report checker",
        },
    };
    return new Promise((resolve, reject) => {
        request(options, (error, response, body) => {
            if (!error) {
                resolve(body);
            } else {
                console.log(reject(error));
            }

        })
    })
}

exports.setLabel2 = function({url, accessToken}){
    let options = { 
        url: `${url}/labels`,
        method: "POST",
        body: JSON.stringify({"labels": ["info-needed"]}),
        headers:{
            "Authorization": `token ${accessToken}`,
            "Accept": "application/vnd.github.machine-man-preview+json",
            "User-Agent": "bug report checker",
        },
    };
    return new Promise ((resolve,reject) => {
        request(options, (error, response, body) => {
            if (!error) {
                resolve(body);
            } else {
                console.log(reject(error));
            }

        })
    })
};
exports.setAssignees = function({url, accessToken, username}){
    let options = {
        url: `${url}/assignees`,
        method: "POST",
        body: JSON.stringify({"assignees": `${username}`}),
        headers:{
            "Authorization": `token ${accessToken}`,
            "Accept": "application/vnd.github.machine-man-preview+json",
            "User-Agent": "bug report checker",
        },
    };
    return new Promise ((resolve,reject) => {
        request(options, (error, response, body) => {
            if (!error) {
                resolve(body);
            } else {
                console.log(reject(error));
            }

        })
    })
};

function makeJwt () {
    const iat = (Date.now() / 1000) | 0;
    const exp = iat + 60 * 10;
    const iss = config.githubAppId;

    return jwt.sign({iat,exp,iss},fs.readFileSync('bug-report-checker.private-key.pem','utf8'), { algorithm: "RS256" }); //is githubCert the private key?
}
