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
const classifier = new Classifier("model/model_ticket_tagger.bin");
const map = new Map();

try {
    // read contents of the file
    const data = fs.readFileSync('model/dict.txt', 'UTF-8');
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


function predict_OB(preOB, fileName) {
    return new Promise ((resolve,reject) => {
        const command = "model/svm_classify -v 1" + ' ' + fileName + ' ' + "model/model_OB.txt" + ' ' + preOB;
        exec(command, function(error,stdout,stderr) {
            if (!error) {
               
                const arrayOB = fs.readFileSync(preOB).toString().split("\n");
                resolve(arrayOB);
            } else{
                  console.log('There was an error in the OB prediction: '+ error);
                  reject(error);
            }
        });
    })
}

function predict_EB(preEB, fileName) {
    return new Promise ((resolve,reject) => {
        const command = "model/svm_classify -v 1" + ' ' + fileName + ' ' + "model/model_EB.txt" + ' ' + preEB;
        exec(command, function(error,stdout,stderr) {
            if (!error) {
                const arrayEB = fs.readFileSync(preEB).toString().split("\n");
                resolve(arrayEB);
            } else{
                console.log('There was an error in the EB prediction: '+ error);
                reject(error);
            }
        });
    })
}
function predict_SR(preSR, fileName) {
    return new Promise ((resolve,reject) => {
        const command = "model/svm_classify -v 1"  + ' ' + fileName + ' ' + "model/model_SR.txt" + ' ' + preSR;
        exec(command, function(error,stdout,stderr) {
            if (!error) {
                const arraySR = fs.readFileSync(preSR).toString().split("\n");
               resolve(arraySR);
            }else{
                console.log('There was an error in the S2R prediction: '+error);
                reject(error);
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
let requestCounter = 1;
async function getComments(body,title,username){
    
    requestCounter++;
    const fileName = "input" + requestCounter + ".dat";
    console.log("Req counter: " + requestCounter);
    if (fs.existsSync(fileName)) {
        fs.unlinkSync(fileName);
    }

    let OB = 0;
    let EB = 0;
    let SR = 0;

    let sentences = body.split("\r");
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
     
        set_insertCode.push(insertCode);
        set_originalInsertCode.push(originalInsertCode);
    }
    let map = new Map();
    let gNum = 0;
    let n = 0;
    const input_title = new nlp.simple.Sentence(title);
    let t = await generateInputVector(input_title);
    fs.appendFileSync(fileName, t + "\n");
    map.set(gNum,title);
    gNum = gNum + 1;
    while(n < sentences.length) {
        if (sentences[n].includes('```')) {
            if (num % 2 === 0) {
                const input = new nlp.simple.Sentence(set_insertCode[num/2]);
                let t = await generateInputVector(input);
                fs.appendFileSync(fileName, t + "\n");
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
                fs.appendFileSync(fileName, t + "\n");
            }
            n = n + 1;
        }else {
            let t = emptySentence();
            fs.appendFileSync(fileName, t + "\n");
            map.set(gNum,"\n");
            gNum = gNum + 1;
            n = n + 1;
        }
    }
    const preEB = "prediction" + requestCounter.toString() + "_EB.txt";
    const preOB = "prediction" + requestCounter.toString() + "_OB.txt";
    const preSR = "prediction" + requestCounter.toString() + "_SR.txt";
    
    try{

       const[arrayOB, arrayEB, arraySR ] = await Promise.all([predict_OB(preOB, fileName), predict_EB(preEB, fileName), predict_SR(preSR, fileName)]);
       let comment1 = "";
       let comment2 = "";
       comment2 = comment2 + "\n**Title:** " + title;

       console.log('Prediction output: ' + arrayOB + "\n " + arrayEB + "\n" + arraySR); 
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
                            line = line + color ;
                            OB = 1;
                        }
                        if (parseFloat(arrayEB[k].replace('\n', '')) > 0) {
                            let color = '<img src="https://i.ibb.co/mBgChsk/eb3.png" width="14" title="Expected Behavior (EB)"/>';
                            line = line + color ;
                            EB = 1;
                        }
                        if (parseFloat(arraySR[k].replace('\n', '')) > 0) {
                            let color = '<img src="https://i.ibb.co/yWS7XhR/s2r2.png" width="14" title="Steps to Reproduce (S2R)"/> ';
                            line = line + color ;
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
           }
           if(EB === 0 && OB !== 0 && SR !== 0) {
               comment1 = comment1 + "- The system's expected behavior (EB) might not have been provided!" + "\n";
           }
           if(SR === 0 && EB !== 0 && OB !== 0){
               comment1 = comment1 + "- The system's steps to reproduce (S2R) might not have been provided!" + "\n";
           }
           if(OB === 0 && EB === 0 && SR !== 0 ){
               comment1 = comment1 + "- The system's observed behavior (OB) and expected behavior(EB) might not have been provided!" + "\n";
           }
           if(EB === 0 && OB !== 0 && SR === 0) {
               comment1 = comment1 + "- The system's expected behavior (EB) and steps to reproduce (S2R) might not have been provided!" + "\n";
           } 
           if(SR === 0 && EB !== 0 && OB === 0){
               comment1 = comment1 + "- The system's observed behavior (OB) and steps to reproduce (S2R) might not have been provided!" + "\n";
           }
           if(SR === 0 && EB === 0 && OB === 0){
            comment1 = comment1 + "- The system's observed behavior (OB), expected behavior (EB), and steps to reproduce (S2R) might not have been provided!" + "\n";
           } 
           comment1 = comment1 + "```\n";
           comment1 = comment1 + "@" + username + " Can you provide this information in the bug report?";
       }
       return [OB, EB, SR, comment1, comment2];
    } catch (err){
          console.log('There was an error: ' + err);
          throw err;
    } finally{
        console.log('Deleting files');

        if (fs.existsSync(preOB)) {
            fs.unlink(preOB, (err) => {
                if (err) throw err;
                console.log(preOB + ' was deleted');
            });
        }
        if (fs.existsSync(preEB)) {
            fs.unlink(preEB, (err) => {
                if (err) throw err;
                console.log(preEB + ' was deleted');
            });
        }
        if (fs.existsSync(preSR)) {
            fs.unlink(preSR, (err) => {
                if (err) throw err;
                console.log(preSR + ' was deleted');
            });
        }
        if (fs.existsSync(fileName)) {
            fs.unlink(fileName, (err) => {
                if (err) throw err;
                console.log(fileName + ' was deleted');
            });
        }
    }
}
exports.getComments = getComments;

async function writeResponse(api_body){
    requestCounter++;
    const fileName = "input" +  requestCounter + ".dat";
   

    console.log("Req counter: "+requestCounter);
    
    
    if (fs.existsSync(fileName)) {
           fs.unlinkSync(fileName);

          /* (err) => {
                 if (err) throw err;
                 console.log('File was deleted: ' + fileName);
           });*/
    }

    let map = new Map();
    let gNum = 0;

    tokenizer.setEntry(api_body); 
    for (let i in tokenizer.getSentences()) {
        let sent = tokenizer.getSentences()[i];
        console.log(sent);
        map.set(gNum, sent);
        gNum  = gNum + 1;
        sent = new nlp.simple.Sentence(sent);
        let t = await generateInputVector(sent);
        console.log(t);
        fs.appendFileSync(fileName, t + "\n");
    }
    const preEB =  "prediction" + requestCounter.toString()  + "_EB.txt";
    const preOB =  "prediction" + requestCounter.toString()  + "_OB.txt";
    const preSR =  "prediction" + requestCounter.toString()  + "_SR.txt";
   
    try{
        const[arrayOB, arrayEB, arraySR] = await Promise.all([predict_OB(preOB, fileName),predict_EB(preEB, fileName), predict_SR(preSR, fileName)]);
        let data = {
           code: 200,
           status: 'success',
           bug_report:{}
        };
      
        console.log('Prediction output: ' + arrayOB +", "+ arrayEB + ", "+arraySR);
   

        let k = 0;
        while(k < gNum){
           let obj_s = [];
           if (parseFloat(arrayOB[k].replace('\n', '')) > 0) {
               obj_s.push("OB");
           }
           if (parseFloat(arrayEB[k].replace('\n', '')) > 0) {
               obj_s.push("EB");
           }
           if (parseFloat(arraySR[k].replace('\n', '')) > 0) {
               obj_s.push("SR");
           }
           data.bug_report[k] = {
               text: map.get(k),
               labels: obj_s
           };
           k = k + 1;
        }
        return data;
    
      }catch(err){
         console.log('There was an error: ' + err);
         throw err;
      }finally{
         console.log('Deleting files');
    
         if (fs.existsSync(preOB)) {
                  fs.unlink(preOB, (err) => {
                        if (err) throw err;
                        console.log(preOB  + ' was deleted');
                  });
          }
         if (fs.existsSync(preEB)) {
                  fs.unlink(preEB, (err) => {
                        if (err) throw err;
                        console.log(preEB + ' was deleted');
                  });
          }
          if (fs.existsSync(preSR)) {
                  fs.unlink(preSR, (err) => {
                        if (err) throw err;
                        console.log(preSR + ' was deleted');
                  });
          }
          if (fs.existsSync(fileName)) {
                  fs.unlink(fileName, (err) => {
                        if (err) throw err;
                        console.log(fileName + ' was deleted');
                  });
          }
    }
   

}
exports.writeResponse = writeResponse;
