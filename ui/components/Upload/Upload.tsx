import { useState, useRef } from 'react';
import { Flex } from 'theme-ui';
import { MdCloudUpload } from 'react-icons/md';
import { toast } from 'react-toastify';

import styles from './Upload.module.css';
import { createImageAsset } from 'services/dbhandler';

function Upload({ images, setImages }) {
	const inputRef = useRef(null);

	return (
		<>
			<form className={styles.uploadForm} onClick={() => inputRef.current.click()}>
				<Flex
					sx={{
						alignItems: 'center',
						justifyContent: 'center',
						flexDirection: 'column',
					}}
				>
					<MdCloudUpload size={30} />
					<div>Upload image</div>
				</Flex>
				<input
					ref={inputRef}
					type='file'
					accept='image/*'
					className='input-field'
					hidden
					onChange={async ({ target: { files } }) => {
						if (files) {
							const formData = new FormData();
							formData.append('image', files[0]);

							await createImageAsset(
								formData,
								(data) => {
									toast.success('Upload successfully!');
									setImages([...images, data.data]);
								},
								(err) => toast.error(err.response.data.message || 'Something went wrong!')
							);
						}
					}}
				/>
			</form>
		</>
	);
}

export default Upload;
