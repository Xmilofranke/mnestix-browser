'use client';

import { useState } from 'react';
import { Box, Button, Skeleton, Typography } from '@mui/material';
import { useNotificationSpawner } from 'lib/hooks/UseNotificationSpawner';
import { FormattedMessage, useIntl } from 'react-intl';
import { messages } from 'lib/i18n/localization';
import { decodeBase64, safeBase64Decode } from 'lib/util/Base64Util';
import { ArrowForward } from '@mui/icons-material';
import { showError } from 'lib/util/ErrorHandlerUtil';
import { AssetAdministrationShell, LangStringNameType } from '@aas-core-works/aas-core3.0-typescript/types';
import { useIsMobile } from 'lib/hooks/UseBreakpoints';
import { getTranslationText } from 'lib/util/SubmodelResolverUtil';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { SubmodelsOverviewCard } from '../_components/SubmodelsOverviewCard';
import { AASOverviewCard } from 'app/[locale]/viewer/_components/AASOverviewCard';
import { useEnv } from 'app/env/provider';
import { useAsyncEffect } from 'lib/hooks/UseAsyncEffect';
import { getAasFromRepository, performFullAasSearch } from 'lib/services/search-actions/searchActions';
import { LocalizedError } from 'lib/util/LocalizedError';

export default function Page() {
    const navigate = useRouter();
    const searchParams = useParams<{ base64AasId: string }>();
    const base64AasId = searchParams.base64AasId;
    const aasIdDecoded = safeBase64Decode(base64AasId);
    const [isLoadingAas, setIsLoadingAas] = useState(false);
    const notificationSpawner = useNotificationSpawner();
    const isMobile = useIsMobile();
    const intl = useIntl();
    const env = useEnv();
    const [aas, setAas] = useState<AssetAdministrationShell>();
    const encodedRepoUrl = useSearchParams().get('repoUrl');
    const repoUrl = encodedRepoUrl ? decodeURI(encodedRepoUrl) : undefined;

    useAsyncEffect(async () => {
        if (aas) {
            return;
        }
        setIsLoadingAas(true);
        await loadAasContent();
        setIsLoadingAas(false);
    }, [base64AasId, env]);

    async function loadAasContent() {
        if (repoUrl) {
            const repoAas = await getAasFromRepository(aasIdDecoded, repoUrl);
            setAas(repoAas ?? undefined);
            return;
        }

        const result = await performFullAasSearch(aasIdDecoded);
        if (!result) {
            showError(new LocalizedError(messages.mnestix.aasUrlNotFound), notificationSpawner);
        } else if (result.aas) {
            setAas(result.aas);
        } else {
            navigate.push(result.redirectUrl);
        }
    }

    const startComparison = () => {
        navigate.push(`/compare?aasId=${encodeURIComponent(aasIdDecoded)}`);
    };

    const pageStyles = {
        display: 'flex',
        flexDirection: 'column',
        gap: '30px',
        alignItems: 'center',
        width: '100%',
        marginBottom: '50px',
        marginTop: '20px',
    };

    const viewerStyles = {
        maxWidth: '1125px',
        width: '90%',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
    };

    return (
        <Box sx={pageStyles}>
            {aas || isLoadingAas ? (
                <Box sx={viewerStyles}>
                    <Box display="flex" flexDirection="row" alignContent="flex-end">
                        <Typography
                            variant="h2"
                            style={{
                                width: '90%',
                                margin: '0 auto',
                                marginTop: '10px',
                                overflowWrap: 'break-word',
                                wordBreak: 'break-word',
                                textAlign: 'center',
                                display: 'inline-block',
                            }}
                        >
                            {isLoadingAas ? (
                                <Skeleton width="40%" sx={{ margin: '0 auto' }} />
                            ) : aas?.displayName ? (
                                getTranslationText(aas?.displayName as LangStringNameType[], intl)
                            ) : (
                                ''
                            )}
                        </Typography>
                        {env.COMPARISON_FEATURE_FLAG && !isMobile && (
                            <Button variant="contained" onClick={startComparison} data-testid="detail-compare-button">
                                <FormattedMessage {...messages.mnestix.compareButton} />
                            </Button>
                        )}
                    </Box>
                    <AASOverviewCard
                        aas={aas ?? null}
                        productImage={aas?.assetInformation?.defaultThumbnail?.path}
                        isLoading={isLoadingAas}
                        isAccordion={isMobile}
                    />
                    {aas?.submodels && aas.submodels.length > 0 && (
                        <SubmodelsOverviewCard smReferences={aas.submodels} />
                    )}{' '}
                </Box>
            ) : (
                <>
                    <Typography
                        variant="h2"
                        style={{
                            width: '90%',
                            margin: '0 auto',
                            marginTop: '10px',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            textAlign: 'center',
                            display: 'inline-block',
                        }}
                    >
                        <FormattedMessage {...messages.mnestix.noDataFound} />
                    </Typography>
                    <Typography color="text.secondary">
                        <FormattedMessage
                            {...messages.mnestix.noDataFoundFor}
                            values={{ name: decodeBase64(base64AasId) }}
                        />
                    </Typography>
                    <Button variant="contained" startIcon={<ArrowForward />} href="/">
                        <FormattedMessage {...messages.mnestix.toHome} />
                    </Button>
                </>
            )}
        </Box>
    );
}
