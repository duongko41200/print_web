import React, { useState } from 'react';

import { Box, Flex } from 'theme-ui';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import Filter from './Filter';

interface FiltersProps {
	onChange: (filters: any) => void;
}

const Filters: React.FC<FiltersProps> = ({ onChange }) => {
	const [filters, setFilters] = useState<any>({});

	const handleChangeFilter = (filter: any) => {
		const newFilters = { ...filters, ...filter };
		setFilters(newFilters);
		onChange(newFilters);
	};

	return (
		<Flex sx={{ alignItems: 'center', columnGap: 20 }}>
			<Box>
				<Filter
					filterKey='template_type'
					label='Type'
					prefixIcon={<FilterAltIcon />}
					onChange={handleChangeFilter}
				/>
			</Box>

			<Box>
				<Filter
					filterKey='template_sort'
					label='Sort by'
					prefixIcon={<ImportExportIcon />}
					onChange={handleChangeFilter}
				/>
			</Box>
		</Flex>
	);
};

export default Filters;
