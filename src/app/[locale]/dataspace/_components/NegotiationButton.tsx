'use client';

import { fetchAsset, fetchCatalogs } from 'lib/api/dataspace-api/dataspace-api';
import { encodeBase64 } from 'lib/util/Base64Util';
import { SubmodelOrIdReference, useAasState, useSubmodelState } from 'components/contexts/CurrentAasContext';
import { useRouter } from 'next/navigation';
import { LoadingButton } from '@mui/lab';
import { useState } from 'react';

type NegotiationButtonProps = {
    assetId: string;
    assetPolicyId: string;
    providerDspUrl: string;
    providerId: string;
};

export function NegotiationButton(props: NegotiationButtonProps) {
    const [, setAas] = useAasState();
    const [, setSubmodels] = useSubmodelState();
    const [isNegotiating, setIsNegotiating] = useState<boolean>(false);
    const navigate = useRouter();

    async function navigateToAas(assetId: string, assetPolicyId: string, providerDspUrl: string, providerId: string) {
        setIsNegotiating(true);
        try {
            const asset = await fetchAsset(assetId, assetPolicyId, providerDspUrl, providerId);
            if (asset['errors']) throw Error(asset['errors'][0]);
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
        const catalogs = await fetchCatalogs();
        const requests = submodelEndpoints.map(async (endpoint: any) => {
            const submodelId = endpoint['keys'][0]['value'];
            const submodelAsset = findSubmodelInCatalogs(catalogs, submodelId);

            if (submodelAsset) {
                const submodel = await fetchAsset(
                    submodelId,
                    submodelAsset.assetPolicyId,
                    submodelAsset.providerDspUrl,
                    submodelAsset.providerId,
                );

                return {
                    id: submodelId,
                    submodel: submodel,
                };
            }

            return null;
        });

        const submodels = await Promise.all(requests);
        // @ts-expect-error submodels cant have null values here
        return submodels.filter(submodel => !!submodel);
    }

    function findSubmodelInCatalogs(catalogs: any[], submodelId: string): NegotiationButtonProps | null {
        for (const catalog of catalogs) {
            const dataset = catalog['dcat:dataset'];

            // This is necessary because for some reason the dataset of the
            // root catalog contains an asset object instead of an array
            if (Array.isArray(dataset)) {
                for (const asset of dataset) {
                    if (asset['@id'] === submodelId && asset['aas-type'] === 'Submodel') {
                        return {
                            assetId: submodelId,
                            assetPolicyId: asset['odrl:hasPolicy']['@id'],
                            providerId: catalog['dspace:participantId'],
                            providerDspUrl: catalog['dcat:service']['dcat:endpointUrl'],
                        };
                    }
                }
            } else {
                if (dataset['@id'] === submodelId && dataset['aas-type'] === 'Submodel') {
                    return {
                        assetId: submodelId,
                        assetPolicyId: dataset['odrl:hasPolicy']['@id'],
                        providerId: catalog['dspace:participantId'],
                        providerDspUrl: catalog['dcat:service']['dcat:endpointUrl'],
                    };
                }
            }

            const result = findSubmodelInCatalogs(catalog['dcat:catalog'], submodelId);
            if (result) return result;
        }

        return null;
    }

    return (
        <LoadingButton
            variant={'outlined'}
            loading={isNegotiating}
            disabled={isNegotiating}
            onClick={() => navigateToAas(props.assetId, props.assetPolicyId, props.providerDspUrl, props.providerId)}
        >
            Initiate Negotiation
        </LoadingButton>
    );
}
