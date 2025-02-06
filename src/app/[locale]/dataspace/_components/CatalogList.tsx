'use client';

import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Divider, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
    fetchCatalogs,
    getContractNegotiation, waitForTransferProcess,
    initiateNegotiation,
    initiateTransfer, getEdrDataAddress, fetchDataFromEndpoint,
} from 'lib/api/dataspace-api/dataspace-api';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { ReactElement, useState } from 'react';

export const CatalogList = () => {
    const [catalogs, setCatalogs] = useState<ReactElement>();

    useAsyncEffect(async() => {
        setCatalogs(await renderCatalogs(await fetchCatalogs()));
    }, [])
    
    const renderCatalogs = async (catalogs: any[]) => {
        return (
            <>
                {await Promise.all(
                    catalogs
                        .filter((catalog) => catalog['@type'] === 'dcat:Catalog')
                        .map(async (catalog, i) => {
                            const providerId = catalog['dspace:participantId'];
                            const endpoint = catalog['dcat:service']['dcat:endpointUrl'];

                            return (
                                <Accordion key={i}>
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon />}
                                        id={'' + i}
                                    >
                                        <Box
                                            sx={{
                                                width: '100%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                paddingY: '.5em',
                                            }}
                                        >
                                            <Typography fontWeight={600}>{providerId}</Typography>
                                            <Typography>&nbsp;</Typography>
                                            <Typography>{endpoint}</Typography>
                                            <Typography>&nbsp;</Typography>
                                        </Box>
                                    </AccordionSummary>
                                    <AccordionDetails>
                                        {await renderDataset(catalog['dcat:dataset'], providerId, endpoint)}
                                        {await renderCatalogs(catalog['dcat:catalog'])}
                                    </AccordionDetails>
                                </Accordion>
                            );
                        }
                    ),
                )}
            </>
        );
    };

    const renderDataset = async (dataset: any[], providerId: string, endpoint: string) => {
        return (
            <>
                {Array.isArray(dataset) ? (
                    <>
                        {await Promise.all(
                            dataset.map(async (asset) => {
                                return await renderAsset(asset, providerId, endpoint);
                            }),
                        )}
                    </>
                ) : (
                    <>{await renderAsset(dataset, providerId, endpoint)}</>
                )}
            </>
        );
    };

    const renderAsset = async (asset: any, providerId: string, endpoint: string) => {
        return (
            <>
                <Divider />
                <Box
                    key={asset['@id']}
                    sx={{
                        width: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        paddingY: '.5em',
                    }}
                >
                    <Typography>{asset['@id']}</Typography>
                    <Button
                        variant={'outlined'}
                        onClick={async () => await fetchAsset(asset['@id'], asset['odrl:hasPolicy']['@id'], endpoint, providerId)}
                    >
                        Initiate Negotiation
                    </Button>
                </Box>
            </>
        );
    };

    const fetchAsset = async (assetId: string, assetPolicyId: string, providerDspUrl: string, providerId: string) => {
        console.log(assetPolicyId)
        const negotiation = await initiateNegotiation(assetId, assetPolicyId, providerDspUrl, providerId);
        const negotiationId = negotiation['@id'];
        console.log(negotiationId);
        const contractNegotiation = await getContractNegotiation(negotiationId);
        const contractAgreementId = contractNegotiation['contractAgreementId'];
        const transferProcess = await initiateTransfer(contractAgreementId, assetId, providerDspUrl, providerId);
        const transferProcessId = transferProcess['@id'];
        console.log(transferProcessId);
        await waitForTransferProcess(transferProcessId);
        const dataAddress = await getEdrDataAddress(transferProcessId);
        const providerEndpoint = dataAddress['endpoint'];
        console.log(providerEndpoint);
        const authorizationToken = dataAddress['authorization'];
        const asset = await fetchDataFromEndpoint(providerEndpoint, authorizationToken);
        console.log(asset);
    };

    return <>{catalogs}</>;
};
