(function(){
    console.log('component-camera initialised');

    const parentCSS = `
        node-red-camera{
            display: block;
        }
    `;

    const templateString = `
        <style>
            :host {
                all: initial;
            }

            main {
                display: flex;
                flex-direction: column;
                width: 100%;
                font-family: sans-serif;
                overflow: hidden;
                justify-content : center;
                align-items: center;
                min-height: 300px;
            }

            main[data-state="inactive"] #preview{
                display: none;
            }

            main[data-type="still"] #preview .controls.video{
                display: none;
            }

            main[data-type="video"] #preview .controls.still{
                display: none;
            }

            main #activate, main #preview{
                border: 1px solid #c7c7c7;
            }
            
            main #activate{
                width: 100%;
                max-width: 300px;
                height: 300px;
                background: #d6d6d6;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
            }

            main #activate p, main #previw p {
                width: 100%;
                text-align: center;
                color: white;
                background: #9c9c9c;
                padding: 1em 0;
                text-shadow: 0 1px 1px black;
                font-weight: 400;
            }

            main[data-state="active"] #activate {
                display: none;
            }

            main #preview{
                display: flex;
                align-items: center;
                min-height: 300px;
                background: #e8e7e7;
                /* padding: 1em; */
                box-sizing: border-box;
                flex-direction: column;
            }

            main #preview video{
                position: fixed;
                left: 100%;
                top: 100%;
            }

            main #preview canvas{
                width: 300px;
            }

            main #preview .controls{
                margin: 1em;
                box-sizing: border-box;
            }

            main #preview button{
                background: #3d70b2;
                border: 1px solid transparent;
                color: white;
                padding: 1em;
                box-sizing: border-box;
                cursor: pointer;
            }

            main #preview button#stopCapture{
                background: #e63e3e;
            }

            main[data-capturing="false"] .controls.video #stopCapture{
                display: none;
            }

            main[data-capturing="true"] .controls.video #captureVideo{
                display: none;
            }

        </style>

        <main data-state="inactive" data-type="still" data-capturing="false">

            <div id="activate">
                <p>click to use camera</p>
            </div>

            <div id="preview">

                <canvas> </canvas>
                <video autoplay playsinline muted> </video>

                <div class="controls still">
                    <button id="captureStill">Take Picture</button>
                </div>

                <div class="controls video">
                    <button id="captureVideo">Record Video</button>
                    <button id="stopCapture">Stop Recording</button>
                </div>

            </div>


        </main>

    `;
    
    const templateElement = document.createElement('template');
    templateElement.innerHTML = templateString;

    const validCaptureTypes = ['still', 'video'];

    document.addEventListener("DOMContentLoaded", function(event) {
        console.log('DOM Loaded, ready to look for components');

        class NRCamera extends HTMLElement {

            constructor() {
                super();

                const domNode = this;

                domNode.attachShadow({mode: 'open'});
                domNode.shadowRoot.appendChild(document.importNode(templateElement.content, true));

                const requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
                let activated = false;

                const main = domNode.shadowRoot.querySelector('main');
                const activate = domNode.shadowRoot.querySelector('#activate');
                const video = domNode.shadowRoot.querySelector('video');
                const canvas = domNode.shadowRoot.querySelector('canvas');
                const ctx = canvas.getContext('2d');

                const stillControls = main.querySelector('.controls.still');
                const stillCapture = stillControls.querySelector('#captureStill');

                const videoControls = main.querySelector('.controls.video');
                const videoRecord = videoControls.querySelector('#captureVideo');
                const videoStop = videoControls.querySelector('#stopCapture');

                let captureType = domNode.getAttribute('data-nr-type') || 'still';

                if(validCaptureTypes.indexOf(captureType) === -1){
                    captureType = 'still';
                }
                
                // Check that capture type is valid, and possible in this browser;
                if(captureType === 'video'){
                    if(!window.MediaRecorder){
                        console.log('MediaRecorder Error:', err);
                        console.log('Defaulting to still capture');
                        captureType = 'still';
                    }
                }

                main.dataset.type = captureType;

                console.log('Capture type:', captureType);

                function drawVideoToCanvas(){
                    ctx.drawImage(video, 0, 0);
                    requestAnimationFrame(drawVideoToCanvas);
                }

                function sendDataToServer(data, type){

                    type = type || captureType;

                    const options = {
                        method : "POST",
                        headers : {
                            "Content-Type" : "application/octet-stream"
                        },
                        body : data
                    };

                    console.log(`${window.location.origin}/nr-component-camera/${domNode.getAttribute('data-nr-name')}?type=${type}`);
                    return fetch(`${window.location.origin}/nr-component-camera/${domNode.getAttribute('data-nr-name')}?type=${type}`, options)
                        .then(res => {

                            if(res.ok){
                                return res.json();
                            } else {
                                throw res;
                            }

                        })
                        .then(response => {
                            console.log('response:', response);
                            dispatchEvent('message', response);
                        })
                        .catch(err => {
                            console.log('fetch err:', err);
                            dispatchEvent('error', err);
                        })
                    ;

                }

                function dispatchEvent(name, data){
                    const event = new CustomEvent(name, {
                        bubbles: true,
                        detail: data
                    });

                    domNode.dispatchEvent(event);
                }

                activate.addEventListener('click', function(){

                    if(activated){
                        return;
                    } else {
                        activated = true;
                    }

                    activate.querySelector('p').textContent = 'attempting to access camera';

                    const constraints = {
                        video : { facingMode: 'environment' },
                        audio : captureType === 'video'
                    };

                    navigator.mediaDevices.getUserMedia(constraints)
                        .then(function(stream) {
                            console.log(stream);

                            const externalStream = stream.clone();

                            video.addEventListener('canplay', function(){

                                this.play();

                                if(main.dataset.state === 'inactive'){
                                    main.dataset.state = 'active';
                                }

                                canvas.width = video.offsetWidth;
                                canvas.height = video.offsetHeight;

                                dispatchEvent('streamavailable', externalStream);

                            });

                            try{
                                const vidURL = window.URL.createObjectURL(stream);
                                video.src = vidURL;
                            } catch(err){

                                console.log('Unable to createObjectURL for stream. Setting srcObject to stream instead...');
                                video.srcObject = stream;

                                setTimeout(function(){
                                    console.log('Video is playing', !video.paused);
                                    if(video.paused){
                                        video.play();
                                    }
                                }, 1000);

                            }

                            video.volume = 0;

                            stillCapture.addEventListener('click', function(){

                                const base64 = canvas.toDataURL('image/png');
                                const imageData = base64.split(',')[1];

                                dispatchEvent('imageavailable', base64);

                                sendDataToServer(imageData);

                            }, false);

                            let mR = undefined;
                            const capturedChunks = [];

                            videoRecord.addEventListener('click', function(){
                                main.dataset.capturing = 'true';
                                mR = new MediaRecorder(stream);
				
                                mR.ondataavailable = function(e){
                                    console.log(e.data);
                                    capturedChunks.push(e.data);
                                }

                                mR.onstop = function(e){
                                    capturedChunks.push(e.data);

                                    var video = document.createElement('video');
                                    video.controls = true;
                                    var blob = new Blob(capturedChunks, { 'type' : 'audio/webm; codecs=vp8' });
                                    
                                    dispatchEvent('videoavailable', blob);

                                    sendDataToServer(blob, captureType);
                                    
                                    capturedChunks.length = 0;
                                    console.log(capturedChunks);

                                }

                                mR.start(800);

                            });

                            videoStop.addEventListener('click', function(){
                                mR.stop();
                                main.dataset.capturing = 'false';
                            });

                            drawVideoToCanvas();

                        })
                        .catch(function(err) {

                            console.log(err);
                            dispatchEvent('error', err);

                        })
                    ;



                }, false);

            }

        }

        window.customElements.define('node-red-camera', NRCamera);

    });

}());