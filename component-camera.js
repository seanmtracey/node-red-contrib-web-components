require('dotenv').config( { silent : process.env.NODE_ENV === 'production' } );
const debug = require('debug')('web-components:component-camera');
const fs = require('fs');

module.exports = function(RED) {

    RED.nodes.registerType("component-camera", function(config){
        
        RED.nodes.createNode(this, config);
    
        var node = this;
        debug('CONFIG:', config);

        if(config.unique && config.unique !== ''){

            RED.httpNode.post(`/nr-component-camera/${config.unique.split('/')[0]}`, function(req, res) {

                const chunks = [];

                req.on('data', function (data) {
                    debug('Data:', data);
                    chunks.push(data);
                });

                req.on('end', function (data){
                    
                    debug('Request ended:', data);

                    res.json({
                        status : "ok",
                        message : "Date received successfully"
                    });
                    
                    let buf;

                    if(req.query.type === 'still'){
                        buf = new Buffer( Buffer.concat(chunks).toString(), 'base64' );
                    } else if(req.query.type === "video"){
                        buf = Buffer.concat(chunks);
                    }

                    node.send({
                        payload: buf
                    });

                    // fs.writeFileSync('/tmp/output.webm', buf);

                });

                req.on('error:', function(err){
                    debug('req err:', err);
                });

            });

        }

    });

    RED.httpNode.get("/web-components/:type", function(req, res) {
        
        fs.readFile(`${__dirname}/component-scripts/${req.params.type}.js`, (err, data) => {
            
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