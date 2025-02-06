import { Accordion, AccordionDetails, AccordionSummary, Box, Button, Divider, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { fetchCatalogs } from 'lib/api/dataspace-api';

export const CatalogList = async () => {
    const catalogs: any[] = await fetchCatalogs();

    const renderCatalogs = (catalogs: any[]) => {
        return (
            <>
                {catalogs
                    .filter((catalog) => catalog['@type'] === 'dcat:Catalog')
                    .map((catalog, i) => {
                        return (
                            <Accordion key={i}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    aria-controls="panel1-content"
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
                                        <Typography fontWeight={600}>{catalog['dspace:participantId']}</Typography>
                                        <Typography>&nbsp;</Typography>
                                        <Typography>{catalog['dcat:service']['dcat:endpointUrl']}</Typography>
                                        <Typography>&nbsp;</Typography>
                                    </Box>
                                </AccordionSummary>
                                <AccordionDetails>
                                    {renderDataset(catalog['dcat:dataset'])}
                                    {renderCatalogs(catalog['dcat:catalog'])}
                                </AccordionDetails>
                            </Accordion>
                        );
                    })}
            </>
        );
    };

    const renderDataset = (dataset: any[]) => {
        return (
            <>
                {Array.isArray(dataset) ? (
                    <>
                        {dataset.map((asset) => {
                            return renderAsset(asset);
                        })}
                    </>
                ) : (
                    <>
                        {renderAsset(dataset)}
                    </>
                )}
            </>
        );
    };

    const renderAsset = (asset: any) => {
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
                    <Button variant={'outlined'}>Initiate Negotiation</Button>
                </Box>
            </>
        );
    }

    return <>{renderCatalogs(catalogs)}</>;
};
