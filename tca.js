function countMessagesBySender(messages, conversationTimeoutMinutes) {
    const senderData = {}; // Object to store data for each sender

    const conversationTimeout = conversationTimeoutMinutes * 60 * 1000;

    messages.forEach(message => {
        if (message.type === "message" && message.from) {
            const sender = message.from;
            const currentTimestamp = message.date_unixtime * 1000; // Convert to milliseconds
            const lastSenderData = senderData[sender] || { lastTimestamp: 0, messagesSent: 0, conversationsStarted: 0 };

            // Check if it's a new conversation (last message more than the specified timeout ago)
            if (currentTimestamp - lastSenderData.lastTimestamp > conversationTimeout) {
                lastSenderData.conversationsStarted += 1;
            }

            lastSenderData.messagesSent += 1;
            lastSenderData.lastTimestamp = currentTimestamp;

            senderData[sender] = lastSenderData;
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