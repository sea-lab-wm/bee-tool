"use strict";
const nlp= require("corenlp").default;
const { Properties, Pipeline ,ConnectorServer} = require("corenlp");
const props = new Properties({ annotators: 'tokenize,ssplit,lemma,pos,ner' });
const connector = new ConnectorServer({ dsn: 'http://localhost:9000' });
const pipeline = new Pipeline(props, 'English', connector );
const fs = require("fs");
const exec = require('child_process').exec;
const { Classifier } = require("fasttext");
const Tokenizer = require('sentence-tokenizer');
const tokenizer = new Tokenizer('Chuck');
const classifier = new Classifier("../model/model.bin");
const map = new Map();

try {
    // read contents of the file
    const data = fs.readFileSync('../model/dict.txt', 'UTF-8');
    // split the contents by new line
    const lines = data.split(/\r?\n/);
    // print all lines
    lines.forEach((line) => {
        if (line){
            let index;
            index = line.lastIndexOf(":");
            let key = line.substring(0, index);
            let value = line.substring(index + 1, line.length);
            map.set(key,value);
        }
    });
} catch (err) {
    console.error(err);
}

function generateInputVector(sent) {
  return pipeline.annotate(sent)
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
            console.log(arr);

            let temp = "0";
            for (i = 0; i < arr.length; i++) {
                temp = temp.concat(" ", arr[i].toString(), ":", "1");
                if (i === (arr.length - 1) && arr[i] < map.size){
                    temp = temp.concat(" ",map.size.toString(), ":", "0");
                }
            }
            return temp;
        })
        .catch(err => {
            console.log('err', err);
        })
}
function emptySentence(){
    let tmp = "0";
    tmp = tmp.concat(" ",map.size.toString(), ":", "0");
    return tmp
}
function predict_OB(inputFile) {
    return new Promise ((resolve,reject) => {
        exec("../model/svm_classify -v 1 input.dat ../model/model_OB.txt predictions_OB.txt", function(error,stdout,stderr) {
            if (!error) {
                const arrayOB = fs.readFileSync('predictions_OB.txt').toString().split("\n");
                resolve(arrayOB);
            } else{
                console.log(reject(error))
            }
        });
    })
}
function predict_EB(inputFile) {
    return new Promise ((resolve,reject) => {
        exec("../model/svm_classify -v 1 input.dat ../model/model_EB.txt predictions_EB.txt", function(error,stdout,stderr) {
            if (!error) {
                const arrayEB = fs.readFileSync('predictions_EB.txt').toString().split("\n");
                resolve(arrayEB);
            } else{
                console.log(reject(error))
            }
        });
    })
}
function predict_SR(inputFile) {
    return new Promise ((resolve,reject) => {
        exec("../model/svm_classify -v 1 input.dat ../model/model_SR.txt predictions_SR.txt", function(error,stdout,stderr) {
            if (!error) {
                const arraySR = fs.readFileSync('predictions_SR.txt').toString().split("\n");
                resolve(arraySR);
            }else{
                console.log(reject(error))
            }
        });
    })
}

async function predict(text) {
    // return [['bug','enhancement','question'][(Math.random() * 2.9999999999999999)|0],0];
    const [prediction] = await classifier.predict(text);
    if (!prediction) {
        return [null, 0];
    }
    const { label, value } = prediction;
    return [label.substring(9), value];
}
exports.predict = predict;

async function getComments(body,title, username){
    const inputFile = fs.createWriteStream('input.dat', {
        flags: 'a'
    });
    let OB = 0;
    let EB = 0;
    let SR = 0;

    let sentences = body.split("\r");
    console.log(sentences);
    let symbolArray = [];
    for (let i in sentences) {
        if (sentences[i].includes('```')) {
            symbolArray.push(i);
        }
    }
    let num = 0;
    let set_insertCode = [];
    let index_insertCode =[];
    let set_originalInsertCode = [];
    console.log(symbolArray);

    let j = 0;
    while (j < (symbolArray.length / 2)) {
        let insertCode = "";
        let originalInsertCode = "";
        let m = j * 2;
        let begin = symbolArray[m];
        let end = symbolArray[m + 1];
        index_insertCode.push(end-begin+1);
        for ( let i in sentences){
            if (Number(i) <= Number(end) && Number(i)>=Number(begin)){
                insertCode = insertCode.concat(sentences[i].replace('\n',''));

                originalInsertCode = originalInsertCode.concat(sentences[i]);
            }
        }
        j = j + 1;
        insertCode = insertCode.replace('```','');
        insertCode = insertCode.replace('```','');
        console.log(insertCode);
        console.log(originalInsertCode);
        set_insertCode.push(insertCode);
        set_originalInsertCode.push(originalInsertCode);
    }
    let map = new Map();
    let gNum = 0;
    let n = 0;
    const input_title = new nlp.simple.Sentence(title);
    let t = await generateInputVector(input_title);
    inputFile.write(t);
    inputFile.write('\n');
    map.set(gNum,title);
    gNum = gNum + 1;
    while(n < sentences.length) {
        if (sentences[n].includes('```')) {
            if (num % 2 === 0) {
                const input = new nlp.simple.Sentence(set_insertCode[num/2]);
                let t = await generateInputVector(input);
                inputFile.write(t);
                inputFile.write('\n');
                map.set(gNum,set_originalInsertCode[num/2]);
                gNum = gNum + 1;
            }

            n = n + index_insertCode[num/2];
            num = num + 2;
        }else if(sentences[n] !== '\n') {
            tokenizer.setEntry(sentences[n]);
            for (let i in tokenizer.getSentences()) {
                let sent = tokenizer.getSentences()[i];
                if (Number(i) === 0){
                    if (sentences[n].indexOf('   ') === 1){
                        map.set(gNum,'\n   '.concat(sent));
                        gNum = gNum + 1;}
                    else{
                        map.set(gNum,'\n'.concat(sent));
                        gNum = gNum + 1;
                    }
                }else{
                    map.set(gNum,sent);
                    gNum = gNum + 1;
                }
                let newsent = sent.replace('**','');
                newsent = newsent.replace('**','');
                newsent = newsent.replace('>','');
                newsent = newsent.replace('_','');
                newsent = newsent.replace('_','');
                newsent = newsent.replace('###','');
                newsent = newsent.replace('#','');
                newsent = newsent.replace('-','');
                newsent = newsent.replace('- [ ]','');
                const input = new nlp.simple.Sentence(newsent);
                let t = await generateInputVector(input);
                inputFile.write(t);
                inputFile.write('\n');
            }
            n = n + 1;
        }else {
            let t = emptySentence();
            inputFile.write(t);
            inputFile.write('\n');
            map.set(gNum,"\n");
            gNum = gNum + 1;
            n = n + 1;
        }
    }
    let arrayOB = await predict_OB('input.dat')
    let arrayEB = await predict_EB('input.dat')
    let arraySR = await predict_SR('input.dat')
    let comment1 = "";
    let comment2 = "";
    comment2 = comment2 + "\n**Title:** " + title ;

    //console.log(gNum);
    let k = 0;
    while(k < gNum){
        if (k === 0){
            let line = "";
            if (parseFloat(arrayOB[k].replace('\n', '')) > 0) {
                let color = '<img src="https://i.ibb.co/1G7bXhB/ob2.png" width="14" title="Observed Behavior (OB)"/>';
                line = line + " " + color;
                OB = 1;
            }
            if (parseFloat(arrayEB[k].replace('\n', '')) > 0) {
                let color = '<img src="https://i.ibb.co/mBgChsk/eb3.png" width="14" title="Expected Behavior (EB)"/>';
                line = line + " " + color;
                EB = 1;
            }
            if (parseFloat(arraySR[k].replace('\n', '')) > 0) {
                let color = '<img src="https://i.ibb.co/yWS7XhR/s2r2.png" width="14" title="Steps to Reproduce (S2R)"/>';
                line = line + " " + color;
                SR = 1;
            }
            comment2 = comment2 + line;
            comment2 = comment2 + "\n";
            comment2 = comment2 + "\n";
            if (body !== ''){
                comment2 = comment2 + "**Description:**\n";
            }

            k = k + 1;

        }
        else{
            let line =  map.get(k);
            if (line.includes('```')){
                let insertCodeColor = '';
                let color1 = '';
                let color2 = '';
                let color3 = '';
                if (parseFloat(arrayOB[k].replace('\n', '')) > 0) {
                    color1 = "[OB]";
                    insertCodeColor =  insertCodeColor  + color1;
                    OB = 1;
                }
                if (parseFloat(arrayEB[k].replace('\n', '')) > 0) {
                    color2 = "[EB]";
                    insertCodeColor =  insertCodeColor  + color2;
                    EB = 1;
                }
                if (parseFloat(arraySR[k].replace('\n', '')) > 0) {
                    color3 = "[SR]";
                    insertCodeColor =  insertCodeColor  + color3;
                    SR = 1;
                }
                if ( color1 === "[OB]"|| color2 === "[EB]" || color3 === "[SR]"){
                    const n = line.lastIndexOf('```');
                    const str2 = line.substring(0, n) + insertCodeColor + '\n' + line.substring(n);
                    comment2 = comment2 + str2;
                    k = k + 1;
                }else{
                    comment2 = comment2 + line;
                    k = k + 1;
                }
            }else if(line !== '\n'){
                if (/[a-zA-Z]/.test(line)) {
                    if (parseFloat(arrayOB[k].replace('\n', '')) > 0) {
                        let color = '<img src="https://i.ibb.co/1G7bXhB/ob2.png" width="14" title="Observed Behavior (OB)"/>';
                        line = line + color + ' ';
                        OB = 1;
                    }
                    if (parseFloat(arrayEB[k].replace('\n', '')) > 0) {
                        let color = '<img src="https://i.ibb.co/mBgChsk/eb3.png" width="14" title="Expected Behavior (EB)"/>';
                        line = line + color + ' ';
                        EB = 1;
                    }
                    if (parseFloat(arraySR[k].replace('\n', '')) > 0) {
                        let color = '<img src="https://i.ibb.co/yWS7XhR/s2r2.png" width="14" title="Steps to Reproduce (S2R)"/> ';
                        line = line + color + ' ';
                        SR = 1;
                    }
                    comment2 = comment2 + line + ' ';
                    k = k + 1;
                }else{
                    comment2 = comment2 + line + ' ';
                    k = k + 1;
                }
            }else{
                comment2 = comment2 + line;
                k = k + 1;
            }
        }
    }
    //comment2 = comment2 + "\n";

    comment1 = comment1 + "**Quality assessment:**\n"
    if(OB !== 0 && EB !==0  && SR!==0 ){
        comment1 = comment1 + "The bug report appears to be complete!";

    }else{
        comment1 = comment1 + "```diff" + "\n";
        if(OB === 0 && EB !== 0 && SR!==0 ){
            comment1 = comment1 + "- The system's observed behavior (OB) might not have been provided!" + "\n";
            comment1 = comment1 + "```\n";
            comment1 = comment1 + "@" + username + " Can you provide this information in the bug report?";
        }
        if(EB === 0 && OB !== 0 && SR !== 0) {
            comment1 = comment1 + "- The system's expected behavior (EB) might not have been provided!" + "\n";
            comment1 = comment1 + "```\n";
            comment1 = comment1 + "@" + username + " Can you provide this information in the bug report?";
        }
        if(SR === 0 && EB !== 0 && OB !== 0){
            comment1 = comment1 + "- The system's steps to reproduce (S2R) might not have been provided!" + "\n";
            comment1 = comment1 + "```\n";
            comment1 = comment1 + "@" + username + " Can you provide this information in the bug report?";
        }
        if(OB === 0 && EB === 0 && SR !== 0 ){
            comment1 = comment1 + "- The system's observed behavior (OB) and expected behavior(EB) might not have been provided!" + "\n";
            comment1 = comment1 + "```\n";
            comment1 = comment1 + "@" + username + " Can you provide this information in the bug report?";
        }
        if(EB === 0 && OB !== 0 && SR === 0) {
            comment1 = comment1 + "- The system's expected behavior (EB) and steps to reproduce (S2R) might not have been provided!" + "\n";
            comment1 = comment1 + "```\n";
            comment1 = comment1 + "@" + username + " Can you provide this information in the bug report?";
        } 
        if(SR === 0 && EB !== 0 && OB === 0){
            comment1 = comment1 + "- The system's observed behavior (OB) and steps to reproduce (S2R) might not have been provided!" + "\n";
            comment1 = comment1 + "```\n";
            comment1 = comment1 + "@" + username + " Can you provide this information in the bug report?";
        }
        if(SR === 0 && EB === 0 && OB === 0){
            comment1 = comment1 + "- The system's observed behavior (OB), expected behavior (EB), and steps to reproduce (S2R) might not have been provided!" + "\n";
            comment1 = comment1 + "```\n";
            comment1 = comment1 + "@" + username + " Can you provide this information in the bug report?";
        }
    }
    return [OB, EB, SR, comment1, comment2]

}
exports.getComments = getComments;
