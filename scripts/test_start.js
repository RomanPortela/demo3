
const startSession = async () => {
    const url = 'http://localhost:3001/api/sessions';
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': '9fA7QmL2RkX8P@wZ6E!dH3sJvC4uB'
            },
            body: JSON.stringify({ name: 'default' })
        });
        console.log('Status:', response.status);
        const text = await response.text();
        console.log('Body:', text);
    } catch (error) {
        console.error('Error:', error);
    }
};

startSession();
