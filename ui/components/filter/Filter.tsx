import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

import { Box, Flex } from 'theme-ui';
import Select, { SelectChangeEvent, SelectProps } from '@mui/material/Select';
import InputLabel from '@mui/material/InputLabel';
import MenuItem, { MenuItemProps } from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import { toast } from 'react-toastify';
import { getAllProducts } from 'services/dbhandler/product';

type MenuItemType = MenuItemProps & {
	label: string;
	default?: boolean;
};

type FilterProps = SelectProps & {
	prefixIcon?: React.ReactNode;
	label: string;
	filterKey: string;
	disabled?: boolean;
	onChange: (filter: any) => void;
	tabKey?: string;
};

const Filter: React.FC<FilterProps> = ({ prefixIcon, label, filterKey, disabled, onChange, tabKey }) => {
	const [products, setProducts] = useState([]);

	useEffect(() => {
		if (tabKey !== '1' && filterKey !== 'product') {
			return;
		}

		const fetchData = async () => {
			const data = await getAllProducts();
			setProducts(data);
		};

		fetchData();
	}, []);

	let items: MenuItemType[];
	if (filterKey === 'type') {
		items = [
			{ value: 'mines', label: 'My designs', default: true },
			{ value: 'shared', label: 'Shared with you' },
		];
	}

	if (filterKey === 'project_template_type') {
		items = [
			{ value: 'mines', label: 'My templates', default: true },
			{ value: 'shared', label: 'Shared with you' },
		];
	}

	if (filterKey === 'template_type') {
		items = [
			{ value: 'all', label: 'All', default: true },
			{ value: 'mines', label: 'My templates' },
			{ value: 'shared', label: 'Shared with you' },
		];
	}

	if (filterKey === 'product') {
		items = [{ value: 'all', label: 'All', default: true }];

		products.forEach((el) => items.push({ value: el.id, label: el.name }));
	}

	if (filterKey === 'sort') {
		items = [
			{ value: 'last_created', label: 'Recently created', default: true },
			{ value: 'last_updated', label: 'Recently updated' },
			{ value: 'first_created', label: 'Oldest created' },
		];
	}

	if (filterKey === 'template_sort') {
		items = [
			{ value: 'trend', label: 'Hot trending', default: true },
			{ value: 'last_created', label: 'Recently created' },
			{ value: 'last_updated', label: 'Recently updated' },
			{ value: 'first_updated', label: 'Oldest updated' },
		];
	}

	const defaultValue = (items?.find((el) => el.default)?.value as string) || (items[0].value as string);

	// Reset current option when tab is changed
	useEffect(() => {
		if (!tabKey) {
			return;
		}
		setValue(defaultValue);
	}, [tabKey]);

	const [value, setValue] = React.useState<string>(defaultValue);
	const handleOnChange = (event: SelectChangeEvent) => {
		setValue(event.target.value as string);
		// router.push({ pathname: router.pathname, query: {} });

		onChange({ [filterKey]: event.target.value });
	};

	return (
		<Box sx={{ minWidth: 120 }}>
			<FormControl fullWidth disabled={disabled}>
				<InputLabel
					children={
						<Flex sx={{ alignItems: 'center', columnGap: '3px' }}>
							{prefixIcon && (
								<div style={{ verticalAlign: 'middle' }} className='prefix-icon-wrapper'>
									{prefixIcon}
								</div>
							)}
							<div>{label}</div>
						</Flex>
					}
					id={`${label.toLowerCase()}-select-label`}
				></InputLabel>

				<Select
					sx={{ '.MuiInputBase-input': { padding: '12px 15px' } }}
					labelId={`${label.toLowerCase()}-select-label`}
					id={`${label.toLowerCase()}-select`}
					name={filterKey}
					value={value}
					label={
						<Flex sx={{ alignItems: 'center', columnGap: '3px' }}>
							{prefixIcon && (
								<div style={{ verticalAlign: 'middle' }} className='prefix-icon-wrapper'>
									{prefixIcon}
								</div>
							)}
							<div>{label}</div>
						</Flex>
					}
					onChange={(e) => handleOnChange(e)}
				>
					{items.map((item, index) => {
						return (
							<MenuItem key={index} value={item.value}>
								{item.label}
							</MenuItem>
						);
					})}
				</Select>
			</FormControl>
		</Box>
	);
};

export default Filter;
