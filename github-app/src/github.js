"use strict";

const crypto = require("crypto");
const request = require('request');
const jwt = require("jsonwebtoken");
const config = require("./config");
const fs = require("fs");


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
