function message(data){
    switch(data.reason){
        case 6:
            return `${data.sender.name} has added you to ${data.project.name}`
        case 4:
            return `${data.sender.name} has updated an issue. ${data.issue.issueKey} ${data.comment.content}`
        case 3:
            return `${data.sender.name} has added an issue. ${data.issue.issueKey} ${data.issue.summary}`
        default:
            return `you should add logic to ${data.reason}.`
    }
}
function show(message, id, space){
    let notification = new Notification("You got a new notification in Backlog", {
        body: `${message}`
    })

    notification.onclick = function () {
        window.open(`https://${space}/globalbar/notifications/redirect/${id}`);
    };
    let notifySound = new Audio("./sounds/bell.mp3");
    notifySound.play();
}

let setId;
const request = (space, apiKey, frequency) => {
    fetch(`https://${space}/api/v2/notifications?apiKey=${apiKey}`).then(
        (response) => {
            if(response.status === 200){
                return response.json()
            } else {
                throw new Error("Setting error")
            }
        }
    ).then(data => {
        let unreadItems = data.filter(item => {
            return item.id > (localStorage.lastId || 0)
        })
        let lastId = data ? data[0].id || 0 : 0
        if(unreadItems.length > 0){
            if(localStorage.lastId){
                unreadItems.forEach(a => show(message(a), a.id, space))
            }
            localStorage.lastId = lastId
        }
        if(frequency){
            setId = setTimeout(
                function(){
                    doRequest()
                }
                , localStorage.frequency * 1000);
        }
    }).catch((e) => {
        console.error(e)
    });
}

if (window.Notification) {
    doRequest()
}

function doRequest(){
    if(localStorage.frequency && localStorage.apiKey && localStorage.spaceName){
        request(localStorage.spaceName, localStorage.apiKey, localStorage.frequency)
    }
}

chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
        if (request.update === true){
            clearTimeout(setId);
            doRequest()
        }
    }
);

