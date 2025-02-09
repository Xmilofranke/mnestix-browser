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

type NegotiationButtonProps = {
    assetId: string,
    assetPolicyId: string,
    providerDspUrl: string,
    providerId: string,
}

export function NegotiationButton(props: NegotiationButtonProps) {
    const [, setAas] = useAasState();
    const navigate = useRouter();

    const fetchAsset = async (assetId: string, assetPolicyId: string, providerDspUrl: string, providerId: string) => {
        console.log(assetPolicyId);
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
        setAas(asset);
        navigate.push(`/viewer/${encodeBase64(assetId)}`);
    };

    return (
        <LoadingButton
            variant={'outlined'}
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
