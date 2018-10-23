(function(){

    'use strict';

    console.log('component-chatbot initialised');

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

        </style>

        <main>

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

                const main = domNode.shadowRoot.querySelector('main');

                function sendDataToServer(data){

                    const options = {
                        method : "POST",
                        headers : {
                            "Content-Type" : "application/json"
                        },
                        body : data
                    };

                    console.log(`${window.location.origin}/nr-component-chatbot/${domNode.getAttribute('data-nr-name')}?type=${type}`);
                    return fetch(`${window.location.origin}/nr-component-chatbot/${domNode.getAttribute('data-nr-name')}?type=${type}`, options)
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

            }

        }

        window.customElements.define('node-red-chatbot', NRChatbot);

    });

}());