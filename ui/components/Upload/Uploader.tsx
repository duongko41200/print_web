import React, { useState, useRef } from 'react';
import { MdCloudUpload, MdDelete } from 'react-icons/md';
import { AiFillFileImage } from 'react-icons/ai';

import styles from './Uploader.module.css';
import { Box } from 'theme-ui';

interface UploaderProps {
	inputRef: React.RefObject<HTMLInputElement>;
	label?: string;
	onChange?: () => void;
}

function Uploader(props: UploaderProps) {
	const [image, setImage] = useState(null);
	const [fileName, setFileName] = useState('No selected file');

	const { inputRef: imageRef, label, onChange } = props;

	const onChangeImage = (e: React.ChangeEvent<HTMLInputElement>) => {
		const files = e.target.files;
		files[0] && setFileName(files[0].name);
		if (files[0]) {
			setImage(URL.createObjectURL(files[0]));
		}
		onChange && onChange();
	};

	return (
		<>
			<Box sx={{fontWeight: 500, color: '#666'}} padding='10px 0 9px'>{label}</Box>
			<div className={styles.formUploader} onClick={() => imageRef.current.click()}>
				<input
					type='file'
					accept='image/*'
					className='input-field'
					hidden
					onChange={onChangeImage}
					ref={imageRef}
					style={{width: '100%'}}
				/>

				{image ? (
					<img loading='lazy' src={image} height='100%' alt={fileName} />
				) : (
					<>
						<MdCloudUpload color='#1475cf' size={60} />
						<p>Browse Files to upload</p>
					</>
				)}
			</div>

			<div className={styles.uploadedRow}>
				<AiFillFileImage color='#1475cf' />
				<span className={styles.uploadContent}>
					{fileName} -
					<MdDelete
						style={{ cursor: 'pointer' }}
						onClick={() => {
							setFileName('No selected File');
							setImage(null);
							imageRef.current.value = '';
						}}
					/>
				</span>
			</div>
		</>
	);
}

export default Uploader;
