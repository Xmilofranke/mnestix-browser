import { Box } from '@mui/material';
import { ViewHeading } from 'components/basics/ViewHeading';
import { CatalogList } from 'app/[locale]/dataspace/_components/CatalogList';
import { useTranslations } from 'next-intl';

export default function Page() {
    const t = useTranslations('dataspaces');

    return (
        <Box sx={{ p: 4, width: '100%', margin: '0 auto' }}>
            <Box sx={{ mb: 3 }}>
                <ViewHeading title={t('dataspace')} />
            </Box>
            <Box>
                <p>{t('pageDescription')}</p>
            </Box>

            <CatalogList/>
        </Box>
    );
}