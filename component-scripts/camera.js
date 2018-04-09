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
                /*padding: 1em;*/
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

            main #preview #capture{
                background: #3d70b2;
                border: 1px solid transparent;
                color: white;
                padding: 1em;
                box-sizing: border-box;
                cursor: pointer;
            }

        </style>

        <main data-state="inactive">

            <div id="activate">
                <p>click to use camera</p>
            </div>

            <div id="preview">

                <canvas> </canvas>
                <video autoplay playsinline> </video>

                <div class="controls still">
                    <button id="capture">Take Picture</div>
                </div>

            </div>


        </main>

    `;

    const templateElement = document.createElement('template');
    templateElement.innerHTML = templateString;

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
                const stillCapture = stillControls.querySelector('#capture');

                function drawVideoToCanvas(){
                    ctx.drawImage(video, 0, 0);
                    requestAnimationFrame(drawVideoToCanvas);
                }

                function sendImageToServer(image){

                    const options = {
                        method : "POST",
                        headers : {
                            "Content-Type" : "application/octet-stream"
                        },
                        body : image
                    }

                    console.log(`${window.location.origin}/nr-component-camera/${domNode.getAttribute('data-nr-name')}`);
                    return fetch(`${window.location.origin}/nr-component-camera/${domNode.getAttribute('data-nr-name')}`, options)
                        .then(res => {

                            if(res.ok){
                                return res.json();
                            } else {
                                throw res;
                            }

                        })
                        .then(response => {
                            console.log('response:', response);

                            const messageEvent = new CustomEvent('message', {
                                bubbles: true,
                                detail: response
                            });

                            domNode.dispatchEvent(messageEvent);

                        })
                        .catch(err => {
                            console.log('fetch err:', err);

                            const errorEvent = new CustomEvent('error', {
                                bubbles: true,
                                detail: err
                            });

                            domNode.dispatchEvent(errorEvent);

                        })
                    ;

                }

                activate.addEventListener('click', function(){

                    if(activated){
                        return;
                    } else {
                        activated = true;
                    }

                    activate.querySelector('p').textContent = 'attempting to access camera';

                    const constraints = {
                        video : { facingMode: "environment" } ,
                        audio : false
                    };

                    navigator.mediaDevices.getUserMedia(constraints)
                        .then(function(stream) {
                            console.log(stream);

                            const externalStream = stream.clone();

                            video.addEventListener('canplay', function(){
                                
                                console.log('Can Play Event');

                                this.play();

                                if(main.dataset.state === 'inactive'){
                                    main.dataset.state = 'active';
                                }

                                canvas.width = video.offsetWidth;
                                canvas.height = video.offsetHeight;

                                const streamavailableEvent = new CustomEvent('streamavailable', {
                                    bubbles: true,
                                    detail: externalStream
                                });
    
                                domNode.dispatchEvent(streamavailableEvent);

                            });

                            try{
                                const vidURL = window.URL.createObjectURL(stream);
                                video.src = vidURL;
                            } catch(err){

                                console.log('err:', err);
                                video.srcObject = stream;
                                
                                setTimeout(function(){
                                    console.log('Video is playing', !video.paused);
                                    if(video.paused){
                                        video.play();
                                    }
                                }, 1000);


                            }

                            stillCapture.addEventListener('click', function(){

                                const base64 = canvas.toDataURL('image/png');
                                const imageData = base64.split(',')[1];

                                sendImageToServer(imageData);

                            }, false);

                            drawVideoToCanvas();

                        })
                        .catch(function(err) {

                            console.log(err);

                            const errorEvent = new CustomEvent('error', {
                                bubbles: true,
                                detail: err
                            });

                            domNode.dispatchEvent(errorEvent);

                        })
                    ;



                }, false);

            }

        }

        window.customElements.define('node-red-camera', NRCamera);

    });

}());