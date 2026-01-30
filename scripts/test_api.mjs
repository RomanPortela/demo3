/**
 * Test the new API endpoint
 */
async function testAPI() {
    const baseUrl = 'http://localhost:3001';

    console.log('=== Testing Portal Credentials API ===\n');

    // Test POST
    console.log('--- Testing POST (save credentials) ---');
    const postRes = await fetch(`${baseUrl}/api/portals/credentials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            portal_name: 'zonaprop',
            username: 'api_test@example.com',
            password: 'test_password_api'
        })
    });
    const postData = await postRes.json();
    console.log('POST Status:', postRes.status);
    console.log('POST Response:', postData);

    // Test GET
    console.log('\n--- Testing GET (read credentials) ---');
    const getRes = await fetch(`${baseUrl}/api/portals/credentials?portal_name=zonaprop`);
    const getData = await getRes.json();
    console.log('GET Status:', getRes.status);
    console.log('GET Response:', getData);

    console.log('\n=== Test Complete ===');
}

testAPI().catch(console.error);
