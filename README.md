# node-red-contrib-web-components
Some Node-red nodes and web components that make integrating some aspects of web sites with Node-red a little easier.

## How does it work?

Each Node-RED node has a corresponding web component that handles the UI and interaction between the two across the network.

The rationale for this can be found [here](https://gist.github.com/seanmtracey/fbecae40da3428ad5aa5a44af2a4a0b7).

For example, if you want to use a camera in a web page, you can drag the `component-camera` node onto your Node-RED flow, configure it to have a unique name (`camera1`), and then add the following piece of markup to your page 

```HTML
<node-red-camera data-nr-name="camera1" data-nr-type="still"></node-red-camera>
```

These two nodes are now linked by way of the unique name. When the web page is loaded, and the component initialised, any data created by that node (in this instance a video or still image) will be passed to the specific node in the Node-RED.

## Quickstart

Having installed the `node-red-contrib-web-components` in your Node-RED instance through to `Manage Pallete` UI, follow the next steps.

1. Copy the content of the `demo-flow.json` file in this repo.
2. Head to your Node-RED instance and create a new flow.
3. Click on the hamburger nenu at the top-right corner of the screen and go to `import > Clipboard` and paste the code you copied from `demo-flow.json`
4. Click on deploy and head to `https://YOUR_NODE_RED_INSTANCE_URL.com/wcdemo`

## Prerequisites for usage

### Polyfill

Not all browsers support web components natively, so you can [include this handy polyfill](https://raw.githubusercontent.com/webcomponents/webcomponentsjs/f38824a19833564d96a5654629faefebb8322ea1/bundles/webcomponents-sd-ce.js) in a `<script>` tag before the `<script>` tags for your web components.


### Script Tags

To use each component, you need to first include a `<script>` tag in the `<head>` of your HTML document that contains the code for that component. For each component you wish to use there is an individual `<script>` tag required.

For example, the camera component will require

```HTML
<script src="/web-components/camera"></script>
```
You can also have an absolute URL if you have a cloud-based Node-RED instance, but that's not required `<script src="http://node-red.blah/web-components/camera"></script>`

```HTML
<script src="/web-components/camera"></script>
```

## Available Nodes

### component-camera

This node / component pair creates a GUI in a web page which enables the user to capture still images and capture video.

**Script tag for Head**

```HTML
<script src="/web-components/camera"></script>
```

**HTML Node**

```HTML
<node-red-camera data-nr-name="camera1"></node-red-camera>
```
This is the minimum required for the node to work. It will create a GUI that allows the user to activate the camera in a browser and take a still image which will be passed to the Node.

**Additional Attributes**

`data-nr-type`

If this attribute is added to the node it can be set to `still` to capture still images or `video` if you want to capture video.

**Events**

There are events that can be listened to on the DOM element when certain interactions and events happen. They are as follows:

#### message

This event will be fired when the Node-RED instance has receievd the image or video captured.

#### error

This event will be fired when an error has occurred somewhere in the component.

#### streamavailable

This event will be fired when a media stream has been created for the web component. The stream is accessible on the `detail` property of the event.

#### imageavailable

This event will be fired once an image has been captured. The base64 for the image can be accessed on the `detail` property of the event.

#### videoavailable

This event will be fired once a video has been captured. The blob for the video can be accessed on the `detail` property of the event.

## Additional Nodes

Only the camera-component is currently complete, but I think the following as a minimum set will make it much easier to build web apps that integrate well with Node-RED nodes.

1. A file selector
2. An audio capture node for recording sound
3. An output node for the server to send data to a client from within a Node-RED flow