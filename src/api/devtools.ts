let acorn = require("acorn");
let jsx = require("acorn-jsx");

function appendToStorage(name:any, data:any){
    var old = localStorage.getItem(name);
    if(old === null) old = "";
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

const sendMessageToBackground = (message: String) => {
    backgroundPageConnection.postMessage({
        name: message,
        tabId: chrome.devtools.inspectedWindow.tabId
    })
}
const getSourceCode = () => {
    
    console.log("Getting the React code");

    chrome.devtools.inspectedWindow.getResources(e => e.filter(obj => {
        if (obj.url.includes("src") && obj.url.includes("localhost")) {
            obj.getContent(e => {
                console.log(e); 
                appendToStorage("jsCode", e)
            })
        }
    }));
    
    console.log("Getting CSS files");
    chrome.devtools.inspectedWindow.getResources(function(resources:any) {
        for(var i = 0; i < resources.length; i++)
        {
            if (resources[i].type === 'stylesheet') {
                console.log("found CSS file!");
                resources[i].getContent(function(content:any) {
                    console.log(content); 
                    appendToStorage("cssCode", content)
                });
                console.log(resources[i]);
            }
        }
    });

    console.log("Getting HTML file");
    chrome.devtools.inspectedWindow.getResources(function(resources:any) {
        for(var i = 0; i < resources.length; i++)
        {
            if (resources[i].type === 'document') {
                console.log("found HTML file!");
                resources[i].getContent(function(content:any) {
                    console.log(content); 
                    appendToStorage("htmlCode", content)
                });
                console.log(resources[i]);
            }
        }
    });

    // console.log("testing out acorn parser");
    //testing out acorn as JSX and JS parser
    // console.log("testing out js parsing");
    // console.log(acorn.parse("1 + 1"));
    // console.log("testing out jsx parsing");

    // console.log(acorn.Parser.extend(jsx()).parse(`
    //     <div className="App">
    //         <header className="App-header">
    //         <img src={logo} className="App-logo" alt="logo" />
    //         <p>
    //             Edit <code>src/App.tsx</code> and save to reload.
    //         </p>
    //         Hello World!
    //         <Button onClick={() => devtools.sendMessageToBackground("Hello from app.js")}
    //             variant="contained"
    //             color="primary"
    //             size="small"> Send Message</Button>
    //             <br/>
    //         <Button onClick={() => devtools.getSourceCode()}
    //             variant="contained"
    //             color="primary"
    //             size="small"> get source code</Button>
    //         </header>
    //     </div>`));
        
    // console.log("done testing out acorn parser");
}

const parseCode = (codeType:string) => {
    console.log("Parsing code...");
    console.log(acorn.parse(localStorage.getItem(codeType)));
    console.log("Done parsing code!");
}

export { init, sendMessageToBackground, getSourceCode, parseCode }

