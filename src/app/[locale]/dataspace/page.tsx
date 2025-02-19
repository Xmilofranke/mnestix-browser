import { Box } from '@mui/material';
import { ViewHeading } from 'components/basics/ViewHeading';
import { CatalogList } from 'app/[locale]/dataspace/_components/CatalogList';
import { fetchCatalogs } from 'lib/api/dataspace-api/dataspace-api';
import { getTranslations } from 'next-intl/server';

export default async function Page() {
    const t = await getTranslations('dataspaces');
    const catalogs = await getCatalogs()

    async function getCatalogs() {
        try {
            return await fetchCatalogs();
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <Box sx={{ p: 4, width: '100%', margin: '0 auto' }}>
            <Box sx={{ mb: 3 }}>
                <ViewHeading title={t('dataspace')} />
            </Box>
            <Box>
                <p>{t('pageDescription')}</p>
            </Box>

            <CatalogList catalogs={catalogs} />
        </Box>
    );
}