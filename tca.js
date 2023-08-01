function countMessagesBySender(messages, conversationTimeoutMinutes) {
    const senderData = {}; // Object to store data for each sender
    var lastTimestamp = 0;
    const conversationTimeout = conversationTimeoutMinutes * 60;

    messages.forEach(message => {
        if (message.type === "message" && message.from) {
            const sender = message.from;
            const currentTimestamp = message.date_unixtime;
            const currentSenderData = senderData[sender] || {
                messagesSent: 0,
                conversationsStarted: 0,
                lastMessageIds: [] // Array to store the last 5 message IDs for conversations started
            };

            // Check if it's a new conversation (last message more than the specified timeout ago)
            if (currentTimestamp - lastTimestamp > conversationTimeout || !lastTimestamp) {
                currentSenderData.conversationsStarted += 1;
                currentSenderData.lastMessageIds.push(message.id);
                if (currentSenderData.lastMessageIds.length > 5) {
                    currentSenderData.lastMessageIds.shift(); // Remove the oldest message ID
                }
            }

            currentSenderData.messagesSent += 1;
            lastTimestamp = currentTimestamp;
            senderData[sender] = currentSenderData;
        }
    });

    return senderData;
}



function parseConversationTimeout(timeoutInput) {
    const timeoutParts = timeoutInput.split(':');
    const conversationTimeoutHours = parseInt(timeoutParts[0], 10);
    const conversationTimeoutMinutes = parseInt(timeoutParts[1], 10);
    return (conversationTimeoutHours * 60) + conversationTimeoutMinutes;
}

function analyzeMessages(jsonFileInputId, conversationTimeoutInputId, resultDivId) {
    const jsonFileInput = document.getElementById(jsonFileInputId);
    const conversationTimeoutInput = document.getElementById(conversationTimeoutInputId);
    const resultDiv = document.getElementById(resultDivId);

    const file = jsonFileInput.files[0];
    const conversationTimeout = parseConversationTimeout(conversationTimeoutInput.value);

    const reader = new FileReader();
    reader.onload = function (event) {
        const jsonData = JSON.parse(event.target.result);
        const messages = jsonData.messages;
        const senderCounts = countMessagesBySender(messages, conversationTimeout);
        const formattedResult = JSON.stringify(senderCounts, null, 2);
        resultDiv.innerText = formattedResult;
    };

    reader.readAsText(file);
}