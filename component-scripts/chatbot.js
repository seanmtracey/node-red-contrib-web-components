(function(){

    'use strict';

    console.log('component-chatbot initialised');

    const parentCSS = `
        node-red-chatbot{
            display: block;
        }
    `;

    const templateString = `
        <style>
            :host {
                all: initial;
            }

            html, body{
                padding: 0;
                margin: 0;
                width: 100%;
                height: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: rgb(245,245,245);
            }

            main{
                width: 300px;
                height: 450px;
                background: white;
                display: flex;
                justify-content: space-between;
                flex-direction: column;
                font-family: sans-serif;
                font-size: 14px;
                max-height: 1000px;
                transition: max-height 0.5s ease-out;
                will-change: max-height;
                transform: rotate3d(0,0,0.1);
            }
            
            main[data-active="false"]{
                max-height: 45px;
                overflow: hidden;
            }

            main header{
                display: flex;
                width: 100%;
                justify-content: space-between;
                padding: 1em;
                box-sizing: border-box;
                background: #000000;
                color: white;
                font-weight: 800;
                min-height: 45px;
                border-bottom: 1px solid white;
            }
            
            main header .close{
                background-size: 100%;
                background-repeat: no-repeat;
                cursor: pointer;
                background-position: 50%;
                font-size: 0.8em;
                font-weight: 400;
                border-radius: 2px;
            }
            
            main div.conversation{
                height: 100%;
                margin: 0;
                padding: 1em;
                display: flex;
                overflow-y: scroll;
                flex-direction: column;
            }
            
            main div.conversation .record{
                display: flex;
                flex-direction: column;
                min-height: min-content;
                justify-content: center;
                align-items: center;
            }

            main div.conversation .record #silence{
                font-style: italic;
                font-size: 0.8em;
                color: rgba(0, 0, 0, 0.35);
            }

            main div.conversation .record #silence[data-active="false"]{
                display: none !important;
            }

            main div.conversation .record .message {
                padding: 0.5em;
                margin: 1em 0;
                display: flex;
                flex-direction: column;
                max-width: 75%;
                word-break: break-word;
                border-radius: 2px;
                align-self: flex-start;
                position: relative;
            }

            main div.conversation .record .message::after{
                content: " ";
                background-color: inherit;
                width: 15px;
                height: 15px;
                position: absolute;
                bottom: 0;
                left: 0;
                margin-bottom: -8px;
                border-radius: 3px;
                -webkit-clip-path: polygon(0 0, 0% 100%, 100% 0);
                clip-path: polygon(0 0, 0% 100%, 100% 0);
            }

            main div.conversation .record .message.human::after{
                background: inherit;
                -webkit-clip-path: polygon(100% 100%, 0 0, 100% 0);
                clip-path: polygon(100% 100%, 0 0, 100% 0);
                right: 0;
                left: inherit;
            }

            main div.conversation .record .message p {
                margin: 0;
                line-height: 1.3em;
            }

            main div.conversation .record .message span{
                font-size: 0.8em;
                right: 0;
                align-self: flex-end;
                margin-top: 0.5em;
                font-weight: 800;
            }
            
            main div.conversation .record .message.bot span{
                align-self: flex-start;
            }

            main div.conversation .record .message.bot{
                background: #e5e5e5;
            }

            main div.conversation .record .message.human{
                background: #466bb0;
                color: white;
                text-align: right;
                align-self: flex-end;
            }

            main footer{
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                padding: 1em;
                background: black;
                border-top: 1px solid white;
            }

            main footer form{
                width: 100%;
                box-sizing: border-box;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            main footer form input[type="text"]{
                width: 100%;
                outline: 0 solid transparent;
                background: rgba(255,255,255,0.2);
                border: 1px solid white;
                padding: 0.5em;
                color: white;
                border-width: 0 0 1px 0;
                font-size: 1em;
            }

            main footer form input[type="submit"]{
                margin-left: 1em;
                background: transparent;
                border: 0 solid transparent;
                color: white;
                font-size: 1em;
                cursor: pointer;
            }

        </style>

        <main data-active="false">
            
            <header>
                <span>Chatbot Component</span>
                <a class="close">open</a>
            </header>
            
            <div class="conversation">

                <div class="record">

                    <!--<div class="message bot">
                        <p>This is the kind of thing that the bot can say. I mean, this is how it would look...</p>
                        <span>18:37</span>
                    </div>
    
                    <div class="message human">
                        <p>And this is what the human would say instead</p>
                        <span>18:38</span>
                    </div>-->

                    <p id="silence" data-active="true">There haven't been any messages yet...</p>

                </div>

            </div>

            <footer>
                
                <form>
                    
                    <input type="text" />
                    <input type="submit" value="Send" />

                </form>

            </footer>

        </main>

    `;

    const templateElement = document.createElement('template');
    templateElement.innerHTML = templateString;

    document.addEventListener("DOMContentLoaded", function(event) {
        console.log('DOM Loaded, ready to look for components');

        class NRChatbot extends HTMLElement {

            constructor() {
                super();

                const domNode = this;

                domNode.attachShadow({mode: 'open'});
                domNode.shadowRoot.appendChild(document.importNode(templateElement.content, true));
                
                const chatbotOrigin = domNode.getAttribute('data-nr-origin') || window.location.origin;
                
                const CONNECTION_ID = domNode.getAttribute('data-nr-name');
                const CHECK_INTERVAL = Number(domNode.getAttribute('data-nr-check-interval')) || 1000;
                const THEME_COLOR = domNode.getAttribute('data-nr-color');
                const INITIAL_OPEN_STATE = domNode.getAttribute('data-nr-opened');
                const TITLE = domNode.getAttribute('data-nr-title');
                let SESSION_UUID;
                let MESSENGER_CONTEXT;

                const main = domNode.shadowRoot.querySelector('main');
                const header = main.querySelector('header');
                const footer = main.querySelector('footer');
                const closeBtn = main.querySelector('.close');
                const form = main.querySelector('footer form');
                const conversation = main.querySelector('div.conversation .record');
                const silence = conversation.querySelector('#silence');

                if(THEME_COLOR){
                    header.style.backgroundColor = THEME_COLOR;
                    footer.style.backgroundColor = THEME_COLOR;
                }

                if(INITIAL_OPEN_STATE ===  "true"){
                    toggleDrawer()
                }
                
                if(TITLE){
                    header.querySelector('span').textContent = TITLE;
                }

                fetch(`${chatbotOrigin}/nr-component-chatbot/get-id`)
                    .then(function(res){
                        if(res.ok){
                            return res.json();
                        } else {
                            throw res;
                        }
                    })
                    .then(function(response){

                        SESSION_UUID = response.data;

                    })
                    .catch(function(err){
                        console.log('err:', err);
                    })
                ;

                function sendMessageToServer(message){

                    const messageOptions = {
                        method : "POST",
                        body : JSON.stringify({
                            message : message,
                            uuid : SESSION_UUID,
                            context : MESSENGER_CONTEXT
                        }),
                        headers : {
                            'Content-Type' : 'application/json'
                        }
                    };

                    return fetch(`${chatbotOrigin}/nr-component-chatbot/${CONNECTION_ID}`, messageOptions)
                        .then(function(res){
                            if(res.ok){
                                return res.json();
                            } else {
                                throw res;
                            }
                        })
                        .then(function(response){
                            return response;
                        })
                        .catch(function(err){
                            console.log('err:', err);
                            throw err;
                        })
                    ;

                }
                
                function addMessageToConversation(message, isBot){

                    isBot = isBot || false;
                    
                    const currentTime = new Date();

                    const currentHour = currentTime.getHours() < 10 ? `0${currentTime.getHours()}` : currentTime.getHours();
                    const currentMinute = currentTime.getMinutes() < 10 ? `0${currentTime.getMinutes()}` : currentTime.getMinutes();

                    const chatFrag = document.createDocumentFragment();
                    
                    const container = document.createElement('div');
                    const text = document.createElement('p');
                    const time = document.createElement('span');

                    container.classList.add('message');
                    isBot === true ? container.classList.add('bot') : container.classList.add('human');
                    
                    text.textContent = message;
                    time.textContent = `${currentHour}:${currentMinute}`;

                    container.appendChild(text);
                    container.appendChild(time);

                    chatFrag.appendChild(container);
                    
                    if(silence.dataset.active === 'true'){
                        silence.dataset.active = 'false';
                    }

                    conversation.appendChild(chatFrag);
                    container.scrollIntoView();

                }

                form.addEventListener('submit', function(e){

                    e.preventDefault();
                    e.stopImmediatePropagation();

                    const message = this[0].value;
                    
                    if(message !== ""){
                        addMessageToConversation(message, false);
                        sendMessageToServer(message);
                        this[0].value = "";
                    }

                });

                const checker = setInterval(function(){

                    if(SESSION_UUID){
                        fetch(`${chatbotOrigin}/nr-component-chatbot/${SESSION_UUID}`)
                            .then(function(res){
                                if(res.ok){
                                    return res.json();
                                } else {
                                    throw res;
                                }
                            })
                            .then(function(response){

                                if(response.messages.length > 0){

                                    response.messages.forEach(function(message){

                                        message.output.text.forEach(function(text){
                                            addMessageToConversation(text, true);
                                        });
                                        
                                        MESSENGER_CONTEXT = message.context;

                                    });

                                }
                            })
                            .catch(function(err){
                                console.log('err:', err);
                            })
                        ;
                    }

                }, CHECK_INTERVAL);

                function toggleDrawer(){
                    main.dataset.active = main.dataset.active === 'false' ? 'true' : 'false';
                    closeBtn.textContent = main.dataset.active === 'false' ? 'open' : 'close';
                }

                closeBtn.addEventListener('click', function(){
                    toggleDrawer();
                }, false);

                function dispatchEvent(name, data){
                    const event = new CustomEvent(name, {
                        bubbles: true,
                        detail: data
                    });

                    domNode.dispatchEvent(event);
                }

            }

        }

        window.customElements.define('node-red-chatbot', NRChatbot);

    });

}());