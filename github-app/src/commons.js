"use strict";

const nlp= require("corenlp").default;
const { Properties, Pipeline ,ConnectorServer} = require("corenlp");
const props = new Properties({ annotators: 'tokenize,ssplit,lemma,pos,ner' });
const connector = new ConnectorServer({ dsn: 'http://localhost:9000' });
const pipeline = new Pipeline(props, 'English', connector );
const fs = require("fs");
const exec = require('child_process').exec;
const map = new Map();

readWords();
function readWords(){
    try {
        // read contents of the file
        const data = fs.readFileSync('../model/dict.txt', 'UTF-8');
        // split the contents by new line
        const lines = data.split(/\r?\n/);
        // print all lines
        lines.forEach((line) => {
            if (line){
                let index = line.lastIndexOf(":");
                let key = line.substring(0, index);
                let value = line.substring(index + 1, line.length);
                map.set(key, value);
            }
        });

        console.log('Words were read: ' + map.size);
    } catch (err) {
        console.error(err);
    }
}
exports.readWords = readWords;

function generateInputVector(sent) {
	if (sent.trim() == ""){
        throw "The sentence is empty"; 
    }
	
	let sentObj = new nlp.simple.Sentence(sent)
	
    return pipeline.annotate(sentObj)
        .then(sent => {
            let array = [];
            let i;
            //unigram/1-pos
            for (i = 0; i < sent.lemmas().length; i++) {
                const unigram = sent.lemma(i);
                if (map.get(unigram) != null) {
                    array.push(Number(map.get(unigram)));
                }
            }
            for (i = 0; i < sent.posTags().length; i++) {
                const tag_1 = sent.posTags(i);
                if (map.get(tag_1) != null) {
                    array.push(Number(map.get(tag_1)));
                }
            }
            //bigram/2-pos
            for (i = 0; i < sent.lemmas().length - 1; i++) {
                const bigram = sent.lemma(i).concat(" ", sent.lemma(i + 1));
                if (map.get(bigram) != null) {
                    array.push(Number(map.get(bigram)));
                }
            }
            for (i = 0; i < sent.posTags().length - 1; i++) {
                const pos2tag = sent.posTags(i).concat(" ", sent.posTags(i + 1));
                if (map.get(pos2tag) != null) {
                    array.push(Number(map.get(pos2tag)));
                }
            }
            //trigram/3-pos
            for (i = 0; i < sent.lemmas().length - 2; i++) {
                const trigram = sent.lemma(i).concat(" ", sent.lemma(i + 1)).concat(" ", sent.lemma(i + 2));
                if (map.get(trigram) != null) {
                    array.push(Number(map.get(trigram)));
                }
            }
            for (i = 0; i < sent.posTags().length - 2; i++) {
                const pos3tag = sent.posTags(i).concat(" ", sent.posTags(i + 1)).concat(" ", sent.posTags(i + 2));
                if (map.get(pos3tag) != null) {
                    array.push(Number(map.get(pos3tag)));
                }
            }

            //sort features
            let temp = "0";
            const uSet = new Set(array);
            let arr = Array.from(uSet);
            arr.sort(function (x, y) {
                if (x < y) {
                    return -1;
                }
                if (x > y) {
                    return 1;
                }
                return 0;
            });
            //format the features for svmlight
            if(arr.length === 0) {
                temp = temp.concat(" ", map.size.toString(), ":", "0");
            }else{
                for (i = 0; i < arr.length; i++) {
                    temp = temp.concat(" ", arr[i].toString(), ":", "1");
                    if (i === (arr.length - 1) && arr[i] < map.size){
                        temp = temp.concat(" ",map.size.toString(), ":", "0");
                    }
                }
            }
            return temp;
        });
}
exports.generateInputVector = generateInputVector;

async function predictOB(inputFile, requestCounter){
    return new Promise ((resolve,reject) => {
        console.log('predictOB '+ requestCounter);
        let outputFile = getOutputFile("ob", requestCounter);
        const command = "../model/svm_classify -v 1" + ' ' + inputFile + ' ' + "../model/model_OB.txt" + ' ' + outputFile;
        exec(command, function(error,stdout,stderr) {
            if (!error) {
                const prediction = fs.readFileSync(outputFile).toString().split("\n");
                resolve(prediction);
            } else{
                console.log('There was an error in the OB prediction: '+ error);
                reject(error);
            }
        });
    });
}
exports.predictOB = predictOB;


async function predictEB(inputFile, requestCounter){
    return new Promise ((resolve,reject) => {
        console.log('predictEB ' + requestCounter);
        let outputFile = getOutputFile("eb", requestCounter);
        const command = "../model/svm_classify -v 1" + ' ' + inputFile + ' ' + "../model/model_EB.txt" + ' ' + outputFile;
        exec(command, function(error,stdout,stderr) {
            if (!error) {
                const prediction = fs.readFileSync(outputFile).toString().split("\n");
                resolve(prediction);
            } else{
                console.log('There was an error in the EB prediction: '+ error);
                reject(error);
            }
        });
    });
}
exports.predictEB = predictEB;

async function predictSR(inputFile, requestCounter){
    return new Promise ((resolve,reject) => {
        console.log('predictS2R ' + requestCounter);
        let outputFile = getOutputFile("s2r", requestCounter);
        const command = "../model/svm_classify -v 1" + ' ' + inputFile + ' ' + "../model/model_SR.txt" + ' ' + outputFile;
        exec(command, function(error,stdout,stderr) {
            if (!error) {
                const prediction = fs.readFileSync(outputFile).toString().split("\n");
                resolve(prediction);
            } else{
                console.log('There was an error in the S2R prediction: '+ error);
                reject(error);
            }
        });
    });
}
exports.predictSR = predictSR;

function getInputFileName(requestCounter){
    const fileName = "input_" +  requestCounter + ".dat";
    return fileName;
}
exports.getInputFileName = getInputFileName;

function getOutputFile(prefix, requestCounter){
    const fileName = "prediction_" +prefix+"_" +  requestCounter + ".dat";
    return fileName;
}
exports.getOutputFile = getOutputFile;
