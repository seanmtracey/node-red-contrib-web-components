
# component-chatbot

This node / component pair creates a GUI in a web page which will create a GUI that allows the user to pass messages to a Node-RED instance and receive replies.

![Chatbot video](/docs/images/component-chatbot-demo.gif)

**Script tag for Head**

```HTML
<script src="/web-components/chatbot"></script>
```

**HTML Node**

```HTML
<node-red-camera data-nr-name="chatbot1"></node-red-camera>
```
This is the minimum required for the node to work.

## Example Flow

`[{"id":"ed2df49c.62a3f8","type":"component-chatbot-reply","z":"56c88b78.4afb94","name":"Chatbot Out","x":690,"y":220,"wires":[]},{"id":"9c4eb6c0.c1cdc8","type":"watson-conversation-v1","z":"56c88b78.4afb94","name":"","workspaceid":"68e967b2-a3ff-4776-8e3f-cb8c8b4e8e4f","multiuser":false,"context":true,"empty-payload":true,"default-endpoint":true,"service-endpoint":"https://gateway.watsonplatform.net/assistant/api","timeout":"","optout-learning":false,"x":480,"y":220,"wires":[["ed2df49c.62a3f8","7eabd3.7ba1a42c"]]},{"id":"5f15f330.98438c","type":"http in","z":"56c88b78.4afb94","name":"","url":"/demo","method":"get","upload":false,"swaggerDoc":"","x":290,"y":180,"wires":[["d260c86a.55bf48"]]},{"id":"d260c86a.55bf48","type":"template","z":"56c88b78.4afb94","name":"Styles","field":"payload.styles","fieldType":"msg","format":"css","syntax":"mustache","template":"html, body{width: 100%;height: 100%;padding: 0;margin: 0; background-color:#f5f5f5;}\n\nnode-red-chatbot{\n    position: fixed;\n    box-shadow: 0 2px 3px rgba(0,0,0,0.32);\n}\n\nnode-red-chatbot[data-nr-name=\"chatbot\"]{\n    bottom: 0;\n    right: 2em; \n}\n\nnode-red-chatbot[data-nr-name=\"second\"]{\n    bottom: 0;\n    right: 2em;\n    left: inherit;\n}","output":"str","x":430,"y":180,"wires":[["c64a984a.b3abf8"]]},{"id":"c64a984a.b3abf8","type":"template","z":"56c88b78.4afb94","name":"JavaScript","field":"payload.script","fieldType":"msg","format":"javascript","syntax":"mustache","template":"//(function(){'use strict';const el = document.querySelector('node-red-camera');console.log('el:', el);el.addEventListener('message', function(e){console.log('message event:', e);}, false);el.addEventListener('error', function(err){console.log('err:', err);}); el.addEventListener('streamavailable', function(data){console.log('streamavailable:', data);}); el.addEventListener('imageavailable', function(data){console.log('imageavailable:', data);}); el.addEventListener('videoavailable', function(data){console.log('videoavailable:', data);}); }());","output":"str","x":570,"y":180,"wires":[["c2cba99f.7b8c68"]]},{"id":"c2cba99f.7b8c68","type":"template","z":"56c88b78.4afb94","name":"HTML","field":"payload","fieldType":"msg","format":"handlebars","syntax":"mustache","template":"<!DOCTYPE html>\n<html>\n    <head>\n        <title>Node-RED Web Components Demo</title>\n        <script src=\"https://unpkg.com/@webcomponents/custom-elements\"></script>\n        <script src=\"https://unpkg.com/@webcomponents/shadydom\"></script>\n        <script src=\"/web-components/chatbot\"></script>\n        <script src=\"/web-components/camera\"></script>\n        <meta name=\"viewport\" content=\"initial-scale=1.0, user-scalable=yes\" />\n        <style>{{{payload.styles}}}</style>\n    </head>\n    <body>\n    \n        <node-red-chatbot data-nr-name=\"chatbot\" data-nr-color=\"black\" data-nr-opened=\"false\" data-nr-check-interval=\"1000\" data-nr-title=\"Chatty McChatface\"></node-red-chatbot>\n        \n       <script>{{{payload.script}}}</script>\n    </body>\n</html>","output":"str","x":710,"y":180,"wires":[["f63877f6.127ce8"]]},{"id":"f63877f6.127ce8","type":"http response","z":"56c88b78.4afb94","name":"","statusCode":"","headers":{},"x":832,"y":179,"wires":[]},{"id":"b95f5b89.240ad8","type":"component-chatbot-receive","z":"56c88b78.4afb94","name":"Chatbot In","unique":"chatbot","x":280,"y":220,"wires":[["9c4eb6c0.c1cdc8"]]},{"id":"7eabd3.7ba1a42c","type":"debug","z":"56c88b78.4afb94","name":"","active":true,"tosidebar":true,"console":false,"tostatus":false,"complete":"false","x":690,"y":260,"wires":[]}]`

## Additional Attributes

`data-nr-color="#FF00FF"`

This attribute can be set to any valid CSS color property to set the color of both the header and footer on the chatbot component

`data-nr-opened="false"`
 
This attribute can be set to `true` or `false` to determine whether or not the chatbot window will be open on page load. By default, the chat box will be compacted.

`data-nr-check-interval="1000"`

This value sets how often the component should look for a response from the Node-RED instance. By default the component checks for an answer every 1000 milliseconds.

`data-nr-origin="www.example.org"`

Thiis value sets the origin for the Node-RED instance that your web component will be communiating with. By default, it will resolve to the origin of the page that it's hosted on, but if you're hosting the chatbot somewhere different from the component, you'll need to set the tag to the origin of the Node-RED instance that's handling the traffic from your web page.

`data-nr-title="Chat Window"`
 
This attribute will set the title of the chat window. By default, it will be "Chatbot Component".

## Events

There are currently no events that can be listened to on this component. They will be added in future release.