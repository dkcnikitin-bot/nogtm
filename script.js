// JavaScript code for modern interactive features

function displayCurrentDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'UTC',
        hour12: false
    };
    const formattedDateTime = now.toLocaleString('sv-SE', options);
    console.log(`Current Date and Time (UTC): ${formattedDateTime}`);
}

displayCurrentDateTime();