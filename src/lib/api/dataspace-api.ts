const CONSUMER_CATALOG_QUERY_URL = 'http://localhost/consumer/fc';
const CONNECTOR_API_KEY = 'password'; // The API Key of the own Connector

async function fetchCatalogs() {
    const jsonBody = {
        '@context': ['https://w3id.org/edc/connector/management/v0.0.1'],
        '@type': 'QuerySpec',
    };

    try {
        const res = await fetch(CONSUMER_CATALOG_QUERY_URL + '/api/catalog/v1alpha/catalog/query', {
            method: 'POST',
            body: JSON.stringify(jsonBody),
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': CONNECTOR_API_KEY,
            },
        });
        const json = await res.json();
        return json;
    } catch (error) {
        console.error(error);
    }
}

export { fetchCatalogs };