require('dotenv').config( { silent : process.env.NODE_ENV === 'production' } );
const debug = require('debug')('web-components:component-camera');
const fs = require('fs');

const TEST_IMAGE = fs.readFileSync(`${__dirname}/resources/test.jpg`);

debug('TEST_IMAGE:', TEST_IMAGE);

module.exports = function(RED) {

    RED.nodes.registerType("component-camera", function(config){
        
        RED.nodes.createNode(this, config);
    
        var node = this;
        debug('CONFIG:', config);

        if(config.unique && config.unique !== ''){

            RED.httpNode.get(`/nr-component-camera/${config.unique.split('/')[0]}`, function(req, res) {
                res.end();
                node.send({
                    payload: TEST_IMAGE
                });
            });

        }

    });

    RED.httpNode.get("/web-components", function(req, res) {
        
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