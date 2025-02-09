'use client';

import {
    fetchDataFromEndpoint,
    getContractNegotiation, getEdrDataAddress,
    initiateNegotiation,
    initiateTransfer,
    waitForTransferProcess,
} from 'lib/api/dataspace-api/dataspace-api';
import { encodeBase64 } from 'lib/util/Base64Util';
import { useAasState } from 'components/contexts/CurrentAasContext';
import { useRouter } from 'next/navigation';
import { LoadingButton } from '@mui/lab';
import { useState } from 'react';

type NegotiationButtonProps = {
    assetId: string,
    assetPolicyId: string,
    providerDspUrl: string,
    providerId: string,
}

export function NegotiationButton(props: NegotiationButtonProps) {
    const [, setAas] = useAasState();
    const [isNegotiating, setIsNegotiating] = useState<boolean>(false);
    const navigate = useRouter();

    const fetchAsset = async (assetId: string, assetPolicyId: string, providerDspUrl: string, providerId: string) => {
        setIsNegotiating(true);
        try {
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
            setAas(asset);
            navigate.push(`/viewer/${encodeBase64(assetId)}`);
        } catch (e) {
            setIsNegotiating(false);
            console.error('Fetching asset from data space failed with error: ' + e);
        }
    };

    return (
        <LoadingButton
            variant={'outlined'}
            loading={isNegotiating}
            disabled={isNegotiating}
            onClick={() =>
                fetchAsset(
                    props.assetId,
                    props.assetPolicyId,
                    props.providerDspUrl,
                    props.providerId,
                )
            }
        >
            Initiate Negotiation
        </LoadingButton>
    );
}
