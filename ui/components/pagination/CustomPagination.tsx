import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';

import type { PaginationProps } from 'antd';
import { Pagination } from 'antd';

interface CustomPaginationProps {
	current: number;
	total: number;
	pageSize: number;
	onChange: (page: number, pageSize: number) => void;
}

const CustomPagination: React.FC<CustomPaginationProps> = ({
	current,
	total,
	pageSize = 10,
	onChange,
}) => {
	const handleOnChange: PaginationProps['onChange'] = (page, pageSize) => {
		onChange(page, pageSize);
	};

	return (
		<Pagination
			defaultCurrent={current}
			total={total}
			onChange={handleOnChange}
			pageSize={pageSize}
		/>
	);
};

export default CustomPagination;
