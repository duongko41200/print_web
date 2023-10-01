import React, { useState } from 'react';

import { Box, Flex } from 'theme-ui';
import CategoryIcon from '@mui/icons-material/Category';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import ImportExportIcon from '@mui/icons-material/ImportExport';
import Filter from './Filter';

interface FiltersProps {
	onChange: (filters: any) => void;
	tabKey?: string;
}

const Filters: React.FC<FiltersProps> = ({ onChange, tabKey }) => {
	const [filters, setFilters] = useState<any>({});

	const handleChangeFilter = (filter: any) => {
		const newFilters = { ...filters, ...filter };
		setFilters(newFilters);
		onChange(newFilters);
	};

	return (
		<Flex sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
			<Box>
				<Flex
					sx={{
						alignItems: 'center',
						justifyContent: 'flex-start',
						columnGap: 20,
					}}
				>
					{tabKey === '3' ? (
						<Filter
							tabKey={tabKey}
							filterKey='project_template_type'
							label='Type'
							prefixIcon={<FilterAltIcon />}
							onChange={handleChangeFilter}
						/>
					) : (
						<Filter
							tabKey={tabKey}
							filterKey='type'
							label='Type'
							prefixIcon={<FilterAltIcon />}
							onChange={handleChangeFilter}
							disabled={tabKey === '2'}
						/>
					)}

					<Filter
						tabKey={tabKey}
						filterKey='product'
						label='Product'
						prefixIcon={<CategoryIcon />}
						onChange={handleChangeFilter}
						disabled={tabKey === '2' || tabKey === '3'}
					/>
				</Flex>
			</Box>

			<Box>
				<Flex
					sx={{
						alignItems: 'center',
						justifyContent: 'flex-end',
						columnGap: 20,
					}}
				>
					<Filter
						tabKey={tabKey}
						filterKey='sort'
						label='Sort by'
						prefixIcon={<ImportExportIcon />}
						onChange={handleChangeFilter}
					/>
				</Flex>
			</Box>
		</Flex>
	);
};

export default Filters;
