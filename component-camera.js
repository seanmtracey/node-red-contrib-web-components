require('dotenv').config( { silent : process.env.NODE_ENV === 'production' } );
const debug = require('debug')('web-components:component-camera');
const fs = require('fs');

const MAX_SUCCESS_DISPLAY_TIME = 3000;

const wires = {};

module.exports = function(RED) {

    RED.nodes.registerType("component-camera", function(config){
        
        debug('Creating node:', this, config);
        RED.nodes.createNode(this, config);
    
        const node = this;
        debug('CONFIG:', config);
        wires[config.id] = config.wires;

        if(config.unique && config.unique !== ''){

            const uniqueID = config.unique.split('/')[0];
            let timeImageWasreceivedAt = 0;

            debug('Registering route for component-camera node:', uniqueID)
            
            RED.httpNode.post(`/nr-component-camera/${uniqueID}`, function(req, res) {
                
                new Promise( (resolve, reject) => {

                    debug('NODE WIRES BEFORE UPDATE:', node.wires);
                    node.updateWires(wires[node.id]);
                    debug('NODE WIRES AFTER UPDATE:', node.wires);

                    const chunks = [];
    
                    req.on('data', function (data) {
                        debug('Data:', data);
                        chunks.push(data);
                    });
    
                    req.on('end', function (data){
                        
                        debug('Request ended:', data);
                        
                        res.set('Access-Control-Allow-Origin', '*');
                        res.set('Access-Control-Allow-Methods', 'GET, POST');
                        res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');

                        res.json({
                            status : "ok",
                            message : "Data received successfully"
                        });
                        
                        let buf;
                        
                        if(req.query.type !== 'still' && req.query.type !== 'video'){
                            reject(`Unknown camera type (should 'still' or video). Refusing to pass on data.`);
                        } else if(req.query.type === 'still'){
                            buf = new Buffer( Buffer.concat(chunks).toString(), 'base64' );
                        } else if(req.query.type === "video"){
                            buf = Buffer.concat(chunks);
                        }
                        
                        resolve(buf);
                        
                    });

                    req.on('error:', function(err){
                        debug('req err:', err);
                        reject(err);
                    });

                })
                .then(imageBuffer => {
                    debug('Image received. Emitting...', imageBuffer);
                    
                    timeImageWasreceivedAt = new Date() * 1;
                    node.status({ fill: "green", shape: "ring", text : 'Data received'});
                    node.send({
                        payload: imageBuffer
                    });

                    setTimeout(function(){

                        const currentTime = new Date() * 1;

                        if(currentTime - timeImageWasreceivedAt > MAX_SUCCESS_DISPLAY_TIME){
                            node.status({ });
                        }

                    }, 3000);

                })
                .catch(err => {
                    node.status({ fill: "red", shape: "ring", text: "Node error" });
                    node.error(err);
                });

            });

        }

    });

    RED.httpNode.get("/web-components/camera", function(req, res) {
    
        fs.readFile(`${__dirname}/component-scripts/camera.js`, (err, data) => {
            
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

}