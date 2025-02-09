'use server';

const CONSUMER_CATALOG_QUERY_URL = 'http://localhost/consumer/fc';
const CONNECTOR_API_KEY = 'password'; // The API Key of the own Connector
const HOST = 'http://localhost/consumer/cp'; // My own control plane

export async function fetchAsset(assetId: string, assetPolicyId: string, providerDspUrl: string, providerId: string) {
    const negotiation = await initiateNegotiation(assetId, assetPolicyId, providerDspUrl, providerId);
    const negotiationId = negotiation['@id'];
    const contractNegotiation = await getContractNegotiation(negotiationId);
    const contractAgreementId = contractNegotiation['contractAgreementId'];
    const transferProcess = await initiateTransfer(contractAgreementId, assetId, providerDspUrl, providerId);
    const transferProcessId = transferProcess['@id'];
    await waitForTransferProcess(transferProcessId);
    const dataAddress = await getEdrDataAddress(transferProcessId);
    const providerEndpoint = dataAddress['endpoint'];
    const authorizationToken = dataAddress['authorization'];
    const asset = await fetchDataFromEndpoint(providerEndpoint, authorizationToken);

    return asset;
}

export async function fetchCatalogs() {
    const jsonBody = {
        '@context': ['https://w3id.org/edc/connector/management/v0.0.1'],
        '@type': 'QuerySpec',
    };

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
}

export async function initiateNegotiation(assetId: string, assetPolicyId: string, providerDspUrl: string, providerId: string) {
    const jsonBody = {
        '@context': ['https://w3id.org/edc/connector/management/v0.0.1'],
        '@type': 'ContractRequest',
        counterPartyAddress: `${providerDspUrl}`,
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

    const res = await fetch(HOST + '/api/management/v3/contractnegotiations', {
        method: 'POST',
        body: JSON.stringify(jsonBody),
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': `${CONNECTOR_API_KEY}`,
        },
    });
    const json = await res.json();
    return json;
}

export async function getContractNegotiation(negotiationId: string, timeout = 10) {
    let state = '';
    let negotiation;
    const startTime = Date.now();

    do {
        const res = await fetch(HOST + `/api/management/v3/contractnegotiations/${negotiationId}`, {
            method: 'GET',
            headers: {
                'X-Api-Key': `${CONNECTOR_API_KEY}`
            }
        });
        negotiation = await res.json();
        state = negotiation.state;

        if ((Date.now() - startTime) > (timeout * 1000)) {
            throw new Error('Waiting for contract negotiation timed out!');
        }

        if (state === 'TERMINATED') {
            throw new Error('Negotiation failed with error ' + negotiation['errorDetail']);
        }
    } while (state !== 'FINALIZED')

    return negotiation;
}

export async function initiateTransfer(contractAgreementId: string, assetId: string, providerDspUrl: string, providerId: string) {
    const jsonBody = {
        '@context': [
            'https://w3id.org/edc/connector/management/v0.0.1'
        ],
        'assetId': `${assetId}`,
        'counterPartyAddress':  `${providerDspUrl}`,
        'connectorId': `${providerId}`,
        'contractId': `${contractAgreementId}`,
        'dataDestination': {
            'type': 'HttpProxy'
        },
        'protocol': 'dataspace-protocol-http',
        'transferType': 'HttpData-PULL'
    }

    const res = await fetch(HOST + '/api/management/v3/transferprocesses', {
        method: 'POST',
        body: JSON.stringify(jsonBody),
        headers: {
            'Content-Type': 'application/json',
            'X-Api-Key': `${CONNECTOR_API_KEY}`
        }
    });
    const json = await res.json();
    return json;
}

export async function waitForTransferProcess(processId: string, timeout = 10) {
    let state = '';
    let transferProcess;
    const startTime = Date.now();

    do {
        const res = await fetch(HOST + `/api/management/v3/transferprocesses/${processId}`, {
            method: 'GET',
            headers: {
                'X-Api-Key': `${CONNECTOR_API_KEY}`
            }
        });
        transferProcess = await res.json();
        state = transferProcess.state;

        if ((Date.now() - startTime) > (timeout * 1000)) {
            throw new Error('Waiting for transfer process timed out!')
        }
    } while (state !== 'STARTED')

    return transferProcess;
}

export async function getEdrDataAddress(transferProcessId: string) {
    const res = await fetch(HOST + `/api/management/v3/edrs/${transferProcessId}/dataaddress`, {
        method: 'GET',
        headers: {
            'X-Api-Key': `${CONNECTOR_API_KEY}`
        }
    });

    const json = await res.json();
    return json;
}

export async function fetchDataFromEndpoint(endpoint: string, authorizationToken: string) {
    // TODO: Why is this used instead of the returned endpoint? (https://github.com/eclipse-edc/MinimumViableDataspace/discussions/424)
    const PROVIDER_PUBLIC_API = 'http://localhost/provider-qna/public';
    const res = await fetch(PROVIDER_PUBLIC_API + '/api/public', {
        method: 'GET',
        headers: {
            'Authorization': authorizationToken
        }
    });
    const json = await res.json();
    return json;
}
