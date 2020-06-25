import * as acorn from "acorn";
let jsx = require("acorn-jsx");

const appendToStorage = (name: string, data: string) => {
    var old = localStorage.getItem(name);
    if (old === null) old = "";
    localStorage.setItem(name, old + data);
}

let backgroundPageConnection: chrome.runtime.Port;

const init = () => {
    backgroundPageConnection = chrome.runtime.connect({
        name: "Hypothesizer"
    });
    backgroundPageConnection.onMessage.addListener(function (message) {
        console.log("Received message from background.js");
        console.log(message);
    })
}

const sendMessageToBackground = (message: string) => {
    backgroundPageConnection.postMessage({
        name: message,
        tabId: chrome.devtools.inspectedWindow.tabId
    })
}

const getSourceCode = () => {

    //get only the files that we want.
    new Promise((resolve, reject) => chrome.devtools.inspectedWindow.getResources(allFiles => {
        try {
            let files = allFiles.filter(file => (file.url.includes("localhost") && file.url.includes("src")));
            return resolve(files)
        } catch (e) {
            return reject("Cannot load files");
        }
    })
    ).then((files: any) => {
        //parsing
        files.forEach((file: any) => {
            console.log(_parseJSCode(file.getContent()))
        });
    }).catch(error => console.log(error))

}

const _parseJSCode = (jsCode: string) => {
    return acorn.Parser.extend(jsx()).parse(jsCode, { sourceType: "module" });
}

export { init, sendMessageToBackground, getSourceCode }

