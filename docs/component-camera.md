
# component-camera

This node / component pair creates a GUI in a web page which enables the user to capture still images and capture video.

![Camera video](/docs/images/component-camera-demo.gif)

**Script tag for Head**

```HTML
<script src="/web-components/camera"></script>
```

**HTML Node**

```HTML
<node-red-camera data-nr-name="camera1"></node-red-camera>
```
This is the minimum required for the node to work. It will create a GUI that allows the user to activate the camera in a browser and take a still image which will be passed to the Node.

## Additional Attributes

`data-nr-type="still"`

If this attribute is added to the node it can be set to `still` to capture still images or `video` if you want to capture video.

## Events

There are events that can be listened to on the DOM element when certain interactions and events happen. They are as follows:

**message**

This event will be fired when the Node-RED instance has receievd the image or video captured.

**error**

This event will be fired when an error has occurred somewhere in the component.

**streamavailable**

This event will be fired when a media stream has been created for the web component. The stream is accessible on the `detail` property of the event.

**imageavailable**

This event will be fired once an image has been captured. The base64 for the image can be accessed on the `detail` property of the event.

**videoavailable**

This event will be fired once a video has been captured. The blob for the video can be accessed on the `detail` property of the event.

## Example Flow

`[{"id":"d9a97726.313368","type":"debug","z":"c0891326.a468e","name":"","active":true,"console":"false","complete":"true","x":430,"y":80,"wires":[]},{"id":"128f72a2.94138d","type":"http in","z":"c0891326.a468e","name":"","url":"/demo/camera","method":"get","upload":false,"swaggerDoc":"","x":130,"y":40,"wires":[["16d514af.27295b"]]},{"id":"16d514af.27295b","type":"template","z":"c0891326.a468e","name":"Styles","field":"payload.styles","fieldType":"msg","format":"css","syntax":"mustache","template":"html, body{\n    width: 100%;\n    height: 100%;\n    padding: 0;\n    margin: 0;\n}\n\n.output{\n    text-align: center;\n    font-family: sans-serif;\n}","output":"str","x":290,"y":40,"wires":[["e58556c4.891cf8"]]},{"id":"e58556c4.891cf8","type":"template","z":"c0891326.a468e","name":"JavaScript","field":"payload.script","fieldType":"msg","format":"javascript","syntax":"mustache","template":"(function(){\n    \n    'use strict';\n    console.log('lol');\n    const el = document.querySelector('node-red-camera');\n    console.log('el:', el);\n    \n    el.addEventListener('message', function(e){\n        console.log('message event:', e);\n    }, false);\n    \n    el.addEventListener('error', function(err){\n        console.log('err:', err);\n    }); \n    \n    el.addEventListener('streamavailable', function(data){\n        console.log('streamavailable:', data);\n    }); \n    \n    el.addEventListener('imageavailable', function(data){\n        console.log('imageavailable:', data);\n    }); \n    \n    el.addEventListener('videoavailable', function(data){\n        console.log('videoavailable:', data);\n    }); \n    \n    const WS = new WebSocket('ws://' + window.location.host + '/demo/camera');\n\n    WS.onopen = function(e){\n        console.log('WS OPEN:', e);\n    };\n\n    WS.onmessage = function(e){\n        console.log('WS MESSAGE:', e);\n\n        if(e.data){\n            const D = JSON.parse(e.data);\n\n            console.log(D);\n\n            var str = ( '<h1>I saw ' + (D.images[0].faces.length) + ' faces') + D.images[0].faces.map( (face, idx) => {\n    \n                var thisFaceIs = '<p>Face ' + (idx + 1) + ' is a... ' + '~' + (face.age.max - ( (face.age.max - face.age.min) / 2 | 0)) + ' year old (' + face.age.score * 100 + '%) ' + face.gender.gender.toLowerCase() + ' (' + face.gender.score * 100 + '%)</p>'\n                return thisFaceIs;\n    \n            }).join('');\n\n\ndocument.body.querySelector('.output').innerHTML = str;\n\ndocument.body.querySelector('.output').innerHTML = str;\n\n            \n            document.body.querySelector('.output').innerHTML = str;\n\n        }\n\n    };\n\n    WS.onclose = function(e){\n        console.log('WS CLOSE:', e);\n    };\n\n    WS.onerror = function(e){\n        console.log('WS ERROR:', e);\n    };\n    \n}());","output":"str","x":430,"y":40,"wires":[["8569399a.438478"]]},{"id":"8569399a.438478","type":"template","z":"c0891326.a468e","name":"HTML","field":"payload","fieldType":"msg","format":"handlebars","syntax":"mustache","template":"<!DOCTYPE html>\n<html>\n    <head>\n        <title>Node-RED Web Components Demo</title>\n        <script src=\"https://unpkg.com/@webcomponents/custom-elements\"></script>\n        <script src=\"https://unpkg.com/@webcomponents/shadydom\"></script>\n        <script src=\"/web-components/camera\"></script>\n        <meta name=\"viewport\" content=\"initial-scale=1.0, user-scalable=yes\" />\n        <style>\n            {{{payload.styles}}}\n        </style>\n    </head>\n    <body>\n        \n        <node-red-camera data-nr-name=\"democamera\" data-nr-type=\"still\"></node-red-camera>\n        \n        <div class=\"output\"></div>\n\n        <script>\n            {{{payload.script}}}\n        </script>\n        \n    </body>\n</html>","output":"str","x":570,"y":40,"wires":[["f298556c.bb1448"]]},{"id":"f298556c.bb1448","type":"http response","z":"c0891326.a468e","name":"","statusCode":"","headers":{},"x":692,"y":39,"wires":[]},{"id":"8fca1dc6.e3b6","type":"visual-recognition-v3","z":"c0891326.a468e","name":"","vr-service-endpoint":"https://gateway.watsonplatform.net/visual-recognition/api","image-feature":"detectFaces","lang":"en","x":250,"y":80,"wires":[["d9a97726.313368","4dec053d.6940fc"]]},{"id":"48c7ce16.53598","type":"websocket out","z":"c0891326.a468e","name":"Camera","server":"167ad620.c3d80a","client":"","x":620,"y":140,"wires":[]},{"id":"4dec053d.6940fc","type":"change","z":"c0891326.a468e","name":"Change","rules":[{"t":"set","p":"payload","pt":"msg","to":"result","tot":"msg"}],"action":"","property":"","from":"","to":"","reg":false,"x":440,"y":140,"wires":[["48c7ce16.53598"]]},{"id":"64d4239a.a9a29c","type":"component-camera","z":"c0891326.a468e","name":"Camera","unique":"democamera","x":90,"y":80,"wires":[["8fca1dc6.e3b6"]]},{"id":"167ad620.c3d80a","type":"websocket-listener","z":"","path":"/demo/camera","wholemsg":"false"}]`