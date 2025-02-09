import { Box, Divider, Typography } from '@mui/material';
import { NegotiationButton } from 'app/[locale]/dataspace/_components/NegotiationButton';

type AssetItemProps = {
    asset: any;
    providerId: string;
    endpoint: string;
};

export async function AssetItem(props: AssetItemProps) {
    return (
        <>
            <Divider />
            <Box
                key={props.asset['@id']}
                sx={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingY: '.75em',
                }}
            >
                <Typography>{props.asset['@id']}</Typography>
                <NegotiationButton
                    assetId={props.asset['@id']}
                    assetPolicyId={props.asset['odrl:hasPolicy']['@id']}
                    providerDspUrl={props.endpoint}
                    providerId={props.providerId}
                />
            </Box>
        </>
    );
}
