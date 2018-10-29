
# component-camera

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
