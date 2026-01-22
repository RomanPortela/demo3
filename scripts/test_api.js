
const testInternalApi = async () => {
    const baseUrl = 'http://localhost:3000'; // Assuming Next.js is on 3000
    try {
        const response = await fetch(`${baseUrl}/api/whatsapp/session`);
        const data = await response.json();
        console.log('Internal API Response:', JSON.stringify(data, null, 2));
    } catch (error) {
        console.error('Error fetching internal API:', error);
    }
};

testInternalApi();
