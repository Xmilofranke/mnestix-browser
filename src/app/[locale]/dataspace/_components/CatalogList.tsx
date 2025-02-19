import { Accordion, AccordionDetails, AccordionSummary, Box, Typography } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { DatasetItem } from 'app/[locale]/dataspace/_components/DatasetItem';

type CatalogListProps = {
    catalogs: any[];
}

export function CatalogList(props: CatalogListProps) {

    return (
        <>
            {props.catalogs
                .filter((catalog: any) => catalog['@type'] === 'dcat:Catalog')
                .map((catalog: any) => {
                        const providerId = catalog['dspace:participantId'];
                        const endpoint = catalog['dcat:service']['dcat:endpointUrl'];

                        return (
                            <Accordion key={catalog['@id']}>
                                <AccordionSummary
                                    expandIcon={<ExpandMoreIcon />}
                                    id={catalog['@id']}
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
                                    <DatasetItem
                                        dataset={catalog['dcat:dataset']}
                                        providerId={providerId}
                                        endpoint={endpoint}
                                    />
                                    <CatalogList
                                        catalogs={catalog['dcat:catalog']}
                                    />
                                </AccordionDetails>
                            </Accordion>
                        );
                    }
                )
            }
        </>
    );
};
