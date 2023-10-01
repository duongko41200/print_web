import React, { useRef, useEffect } from 'react';
import CustomCard, { CustomCardProps } from './Card';

interface InfiniteCardProps extends CustomCardProps {
	isLast: boolean;
	newLimit: () => void;
}

const InfiniteCard: React.FC<InfiniteCardProps> = ({ title, imageUrl, isLast, newLimit, ...other }) => {
	const cardRef = useRef(null);

	useEffect(() => {
		if (!cardRef?.current) {
			return;
		}

		const observer = new IntersectionObserver(([entry]) => {
			if (isLast && entry.isIntersecting) {
				newLimit();
				observer.unobserve(entry.target);
			}
		});

		observer.observe(cardRef.current);
	}, [isLast]);

	return <CustomCard ref={cardRef} title={title} imageUrl={imageUrl} {...other} />;
};

export default InfiniteCard;
