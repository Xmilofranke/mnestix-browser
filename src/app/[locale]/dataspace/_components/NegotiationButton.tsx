'use client';

import { fetchAsset } from 'lib/api/dataspace-api/dataspace-api';
import { encodeBase64 } from 'lib/util/Base64Util';
import { SubmodelOrIdReference, useAasState, useSubmodelState } from 'components/contexts/CurrentAasContext';
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
    const [, setSubmodels] = useSubmodelState();
    const [isNegotiating, setIsNegotiating] = useState<boolean>(false);
    const navigate = useRouter();

    async function navigateToAas(assetId: string, assetPolicyId: string, providerDspUrl: string, providerId: string) {
        setIsNegotiating(true);
        try {
            const asset = await fetchAsset(assetId, assetPolicyId, providerDspUrl, providerId);
            setAas(asset);
            const submodels = await fetchSubmodels(asset['submodels']);
            setSubmodels(submodels);
            navigate.push(`/viewer/${encodeBase64(assetId)}`);
        } catch (e) {
            setIsNegotiating(false);
            console.error('Fetching asset from data space failed with error: ' + e);
        }
    }

    async function fetchSubmodels(submodelEndpoints: any[]): Promise<SubmodelOrIdReference[]> {
        const requests = submodelEndpoints.map(async (endpoint: any) => {
            const submodelId = endpoint['keys'][0]['value'];
            const { assetPolicyId, providerDspUrl, providerId } = await findSubmodelInCatalogs(submodelId);
            const submodel = await fetchAsset(submodelId, assetPolicyId, providerDspUrl, providerId);

            return {
                id: submodelId,
                submodel: submodel,
            };
        });

        const submodels = await Promise.all(requests);
        return submodels;
    }
    
    async function findSubmodelInCatalogs(submodelId: string) {
        const assetPolicyId = '';
        const providerDspUrl = '';
        const providerId = '';
        // TODO: find submodels in catalogs

        return { assetPolicyId, providerDspUrl, providerId };
    }

    return (
        <LoadingButton
            variant={'outlined'}
            loading={isNegotiating}
            disabled={isNegotiating}
            onClick={() =>
                navigateToAas(
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
