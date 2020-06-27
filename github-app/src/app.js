"use strict";

const Koa = require("koa");
const bodyParser = require("koa-bodyparser");
const {get, post} = require('koa-route');
const config = require("./config");
const github = require("./github");
const classifier = require("./classifier");
const sleep = require('sleep');

module.exports = function() {

    const app = new Koa();
    app.use(
        get('/status',async ctx => {
            ctx.body = {message:"bug_report_checker_lives!"};
            ctx.status = 200;
        })
    );
    app.use(bodyParser());
    app.use(
        post(
            "/payload", async ctx => {
                /* payload check */
                ctx.assert(
                    github.verifySignature({
                        payload: JSON.stringify(ctx.request.body),//convert payload to JSON format
                        // the registered app must have a secret set, the secret is used to authenticate as an app for requiring access token
            	        secret: config.githubPrivateKey,
            	        signature: ctx.headers["x-hub-signature"] //Every event that Github sends includes a request header called "x-hub-signature"
                    }),
                    401,
        	        "invalid signature!"
                );
                if (ctx.request.body["action"] === "opened") {
                    //every event has an additional action field that indicates the type of action that triggered the events. For issue event, the action field can be asssigned, labeled, opened and so on.
                    // console.log("detect issue opened");
                    const {labels, body, url, title, user} = ctx.request.body["issue"];
                   
                    const username = user["login"];
                    const installationId = ctx.request.body["installation"].id;
                    let accessToken = await github.getAccessToken(installationId);
                    const [prediction, similarity] = await classifier.predict(
                        `${title} ${body}`
                    );

                    if (similarity > 0) {
                        /* update label */rm
                        await github.setLabels({ url:url, accessToken, prediction });
                    }
                    if (prediction === "bug"){
                        const [OB, EB, SR, comment1, comment2] = await classifier.getComments(body,title,username);
                        if(OB === 0 || EB === 0 || SR === 0 ){
                            await github.setComments1({ url: url, accessToken, comment1})
                            sleep.sleep(1);
                            await github.setAssignees({ url: url, accessToken,username})
                            await github.setLabel2({ url: url, accessToken});
                            sleep.sleep(1);
                            await github.setComments2({ url: url, accessToken,comment2});
                        }else{
                            await github.setComments1({ url: url, accessToken, comment1});
                            sleep.sleep(1);
                            await github.setComments2({ url: url, accessToken,comment2});
                        }
                    }
                }
                ctx.status = 200;
            })
    )
    app.use(
        post(
            "/api",  async ctx => {
                const api_body = ctx.request.body["text"];
                try {
                    const data = await classifier.writeResponse(api_body);
                    ctx.response.type = 'application/json';
                    ctx.response.body = JSON.stringify(data);
                }catch(err){
                    const data = {
                        code: 500,
                        status: 'failed',
                        message: 'The text is null'
                    }
                        ctx.response.type = 'application/json';
                        ctx.response.body = JSON.stringify(data);

                }
            }
        )
    )
    return app;
};

   
