
# component-chatbot

This node / component pair creates a GUI in a web page which will create a GUI that allows the user to pass messages to a Node-RED instance and receive replies.

**Script tag for Head**

```HTML
<script src="/web-components/chatbot"></script>
```

**HTML Node**

```HTML
<node-red-camera data-nr-name="chatbot1"></node-red-camera>
```
This is the minimum required for the node to work.

## Additional Attributes

`data-nr-color="black"` `data-nr-color="#FF00FF"` `data-nr-color="rgba(255, 255, 0, 1.0)"`

This attribute can be set to any valid CSS color property to set the color of both the header and footer on the chatbot component

`data-nr-opened="false"`
 
This attribute can be set to `true` or `false` to determine whether or not the chatbot window will be open on page load. By default, the chat box will be compacted.

`data-nr-check-interval="1000"`

This value sets how often the component should look for a response from the Node-RED instance. By default the component checks for an answer every 1000 milliseconds.

`data-nr-origin="www.example.org"`

Thiis value sets the origin for the Node-RED instance that your web component will be communiating with. By default, it will resolve to the origin of the page that it's hosted on, but if you're hosting the chatbot somewhere different from the component, you'll need to set the tag to the origin of the Node-RED instance that's handling the traffic from your web page.

## Events

There are currently no events that can be listened to on this component. They will be added in future release.