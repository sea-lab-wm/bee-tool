"use strict";
const fs = require("fs");
const Tokenizer = require('sentence-tokenizer');
const tokenizer = new Tokenizer('Chuck');
const crypto = require('crypto');
const commons = require("./commons");

function parseSentences(text, requestCounter){
    console.log('parseSentences '+requestCounter );
    
	let modifiedSentences = []
    let originalSentences = []
    
	if (text.trim() == ""){
        return {modifiedSentences, originalSentences};
    }

    let sentences = text.split("\n");

    // process insertCode, store the index of insertCode symbol
    let symbolArray = [];
    for (let i in sentences) {
        if (sentences[i].includes('```')) {
            symbolArray.push(i);
        }
    }
    let indexOfInsertCode =[];
    let setOfInsertCode = [];
    let setOfOriginalInsertCode = []
    let j = 0;
    while (j < (symbolArray.length / 2)) {
        let insertCode = "";
        let originalInsertCode = "";
        let m = j * 2;
        let begin = symbolArray[m];
        let end = symbolArray[m + 1];
        indexOfInsertCode.push(end - begin + 1);
        for (let i in sentences) {
            if (Number(i) <= Number(end) && Number(i) >= Number(begin)) {
                insertCode = insertCode.concat(sentences[i].replace('\n', ''));
                originalInsertCode = originalInsertCode.concat(sentences[i]);
            }
        }
        j = j + 1;
        insertCode = insertCode.replace('```', '');
        insertCode = insertCode.replace('```', '');

        setOfInsertCode.push(insertCode);
        setOfOriginalInsertCode.push(originalInsertCode);
    }
    
	let num = 0;
    let k  =  0
    while( k < sentences.length) {
        if (sentences[k].includes('```')) {
			let sentTxt = setOfInsertCode[num/2]
			if (!commons.isEmptySentence(sentTxt)){ 
				modifiedSentences.push(sentTxt);
				originalSentences.push(setOfOriginalInsertCode[num/2]);
			}
            k = k + indexOfInsertCode[num/2];
            num = num + 2;
        }else if(sentences[k] !== "") {
            tokenizer.setEntry(sentences[k]);
            for (let i in tokenizer.getSentences()) {
                let sent = tokenizer.getSentences()[i];
                let newsent = sent.replace('**','');
                newsent = newsent.replace('**','');
                newsent = newsent.replace('>','');
                newsent = newsent.replace('_','');
                newsent = newsent.replace('_','');
                newsent = newsent.replace('###','');
                newsent = newsent.replace('#','');
                newsent = newsent.replace('-','');
                newsent = newsent.replace('- [ ]','');
				
				if (!commons.isEmptySentence(newsent)){ 
					modifiedSentences.push(newsent);
					originalSentences.push(sent);
				}
            }
            k = k + 1;
        }
        else{
            k = k + 1;
        }

    }
    return {modifiedSentences, originalSentences};
}

async function encode(sentences, originalSentences, requestCounter){
    console.log('encode ' + requestCounter);

    let sentVectors = [];
    for (let i in sentences) {
        let sentence = sentences[i];
        let origSentence = originalSentences[i];
		try{
			let sentVector = await commons.generateInputVector(sentence);
			sentVectors.push(sentVector);
		}catch(ex){
			console.log("Error encoding sentence: \"" + sentence.toString() + "\"" );
			console.log("Original sentence: \"" + origSentence+ "\"");
			console.log(ex);
			throw ex;
		}
    }

    return sentVectors;
}


function writeVectors(sentVectors, requestCounter){

    console.log('writeVectors '+requestCounter);
    let inputFile = commons.getInputFileName(requestCounter);

    //create empty file
    fs.closeSync(fs.openSync(inputFile, 'w'));

    for (let i in sentVectors) {
        let sentVector = sentVectors[i];
        fs.appendFileSync(inputFile, sentVector + "\n");
    }

    // if (fs.existsSync(inputFile)) {
    //     console.log(inputFile + ' exists!');
    // }else{
    //     console.log(inputFile + ' does not exist!');
    // }
    return inputFile;
}

function getDefaultRespose(){
    let response = {
        code: 200,
        status: 'success',
        bug_report:{}
    };
    return response;
}


function getResponse(sentences, obPrediction, ebPrediction, s2rPrediction, requestCounter){

    console.log('getResponse '+ requestCounter);
    let response = getDefaultRespose();

    for (let k in sentences) {
        let sentence = sentences[k];
        let labels = [];

        if (parseFloat(obPrediction[k]) > 0) {
            labels.push("OB");
        }
        if (parseFloat(ebPrediction[k]) > 0) {
            labels.push("EB");
        }
        if (parseFloat(s2rPrediction[k]) > 0) {
            labels.push("SR");
        }

        response.bug_report[k] = {
            text: sentence.replace("\n", ""),
            labels: labels
        };
    }
    return response;
}

function removeFiles(requestCounter){
    console.log("removeFiles " + requestCounter)

    let filesToRemove = [commons.getInputFileName(requestCounter),
        commons.getOutputFile("ob", requestCounter),
        commons.getOutputFile("eb", requestCounter),
        commons.getOutputFile("s2r", requestCounter)
    ];

    for(let i in filesToRemove){
        let file = filesToRemove[i];
        if (fs.existsSync(file)) {
            fs.unlink(file, (err) => {
                if (err) throw err;
                console.log(file + ' was deleted');
            });
        };
    }
}


async function processText(text) {
    const requestCounter = crypto.randomBytes(20).toString('hex');
    try {
        //parse the sentences
        let sentences = parseSentences(text, requestCounter);
        if(sentences.modifiedSentences.length == 0){
            return getDefaultRespose();
        }

        //encode the sentences
        let sentVectors = await encode(sentences.modifiedSentences, sentences.originalSentences, requestCounter);
        //write the sentences to a file
        let inputFile = writeVectors(sentVectors, requestCounter);

        const[obPrediction, ebPrediction, s2rPrediction] = await Promise.all([commons.predictOB(inputFile, requestCounter),
            commons.predictEB(inputFile, requestCounter),
            commons.predictSR(inputFile, requestCounter)]);

        //read the prediction
        let response = getResponse(sentences.originalSentences, obPrediction, ebPrediction, s2rPrediction, requestCounter);
        return response;
    }catch(err){
        console.log('There was an error: ' + err);
        throw err;
    }finally{
        removeFiles(requestCounter);
    }
}
exports.processText = processText
