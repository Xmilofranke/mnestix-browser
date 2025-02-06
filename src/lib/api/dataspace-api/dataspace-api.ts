'use server';

const CONSUMER_CATALOG_QUERY_URL = 'http://localhost/consumer/fc';
const CONNECTOR_API_KEY = 'password'; // The API Key of the own Connector
const HOST = 'http://localhost/consumer/cp'; // My own control plane

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

async function initiateNegotiation(assetId: string, assetPolicyId: string, providerDspUrl: string, providerId: string) {
    const jsonBody = {
        '@context': ['https://w3id.org/edc/connector/management/v0.0.1'],
        '@type': 'ContractRequest',
        counterPartyAddress: `${providerDspUrl}/api/dsp`,
        counterPartyId: `${providerId}`,
        protocol: 'dataspace-protocol-http',
        policy: {
            '@type': 'Offer',
            '@id': `${assetPolicyId}`,
            assigner: `${providerId}`,
            permission: [],
            prohibition: [],
            obligation: {
                action: 'use',
                constraint: {
                    leftOperand: 'DataAccess.level',
                    operator: 'eq',
                    rightOperand: 'processing',
                },
            },
            target: `${assetId}`,
        },
        callbackAddresses: [],
    };

    try {
        const res = await fetch(HOST + '/api/management/v3/contractnegotiations', {
            method: 'POST',
            body: JSON.stringify(jsonBody),
            headers: {
                'Content-Type': 'application/json',
                'X-Api-Key': 'password',
            },
        });
        const json = await res.json();
        return json;
    } catch (error) {
        console.error(error);
    }
}

export { fetchCatalogs, initiateNegotiation };
