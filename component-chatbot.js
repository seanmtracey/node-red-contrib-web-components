require('dotenv').config( { silent : process.env.NODE_ENV === 'production' } );
const debug = require('debug')('web-components:component-chatbot');
const fs = require('fs');
const uuid = require('uuid/v4');

const wires = {};

const connectionQueue = {};

module.exports = function(RED) {

    RED.nodes.registerType("component-chatbot-receive", function(config){
        
        debug('Creating node:', this, config);
        RED.nodes.createNode(this, config);
    
        const node = this;
        debug('CONFIG:', config);
        wires[config.id] = config.wires;

        RED.httpNode.all('/nr-component-chatbot/*', (req, res, next) => {
            res.set('Access-Control-Allow-Origin', '*');
            res.set('Access-Control-Allow-Methods', 'GET, POST');
            res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
            next();
        });

        if(config.unique && config.unique !== ''){

            const uniqueID = config.unique.split('/')[0];

            RED.httpNode.post(`/nr-component-chatbot/${uniqueID}`, function(req, res) {

                node.updateWires(wires[node.id]);
                
                console.log(req.body);

                node.send({
                    payload : req.body.message,
                    'nr-component-chatbot-id' : req.body.uuid,
                    params : {
                        context  : req.body.context
                    }
                });

                res.json({
                    status : "ok",
                    message : "Data received successfully"
                });
                
            });

        }

    });

    RED.nodes.registerType("component-chatbot-reply", function(config){
        
        debug('Creating node:', this, config);
        RED.nodes.createNode(this, config);
    
        const node = this;
        debug('CONFIG:', config);
        wires[config.id] = config.wires;

        if(config.unique && config.unique !== ''){

            node.on('input', function(msg) {

                if(msg['nr-component-chatbot-id']){
                    connectionQueue[ msg[ 'nr-component-chatbot-id' ] ].messages.push(msg.payload);
                }

            });

            RED.httpNode.get(`/nr-component-chatbot/:queueUUID`, function(req, res) {
                
                res.set('Access-Control-Allow-Origin', '*');
                res.set('Access-Control-Allow-Methods', 'GET, POST');
                res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');

                node.updateWires(wires[node.id]);
                
                const queueUUID = req.params.queueUUID;

                if(connectionQueue[queueUUID]){

                    res.json(connectionQueue[queueUUID]);
                    connectionQueue[queueUUID].messages = [];

                } else {

                    res.status(404);
                    res.json({
                        status : 'err',
                        message : `No message queue with id ${queueUUID} was found`
                    });

                }

            });

        }

    });

    RED.httpNode.all('/web-components/chatbot*', function(req, res, next) {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST');
        res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
        next();
    });

    RED.httpNode.get("/web-components/chatbot", function(req, res) {
    
        fs.readFile(`${__dirname}/component-scripts/chatbot.js`, (err, data) => {
            
            if(err){
                debug('FS err:', err);
                res.status(404);
                res.end();
            } else {
                res.set('Content-Type', 'application/javascript');
                res.send(data);
            }

        });

    });

    RED.httpNode.get("/nr-component-chatbot/get-id", function(req, res) {

        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET, POST');
        res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');

        const queueUUID = uuid();

        connectionQueue[queueUUID] = {
            messages : []
        };

        res.json({
            status : "ok",
            data : queueUUID
        });

    });

}