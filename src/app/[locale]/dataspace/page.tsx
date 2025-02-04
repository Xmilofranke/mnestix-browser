'use client';

import { Box } from '@mui/material';
import { ViewHeading } from 'components/basics/ViewHeading';
import { FormattedMessage } from 'react-intl';
import { messages } from 'lib/i18n/localization';

export default function Page() {
    return (
        <Box sx={{ p:4, width: '100%', margin: '0 auto' }}>
            <Box sx={{ mb: 3 }}>
                <ViewHeading title={<FormattedMessage {...messages.mnestix.dataspace} />}/>
            </Box>
            <Box>
                <p>Data Space Shenanigans start here!</p>
            </Box>
        </Box>
    );
}