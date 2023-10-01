import axios from "axios";
import { toast } from "react-toastify";

import getConfig from 'next/config';
const { publicRuntimeConfig } = getConfig();

interface ParamsProps {
	key?: string;
	q?: string;
	page?: number;
	per_page?: number;
	image_type?: string;
}

interface ImageProps {
	previewURL: string;
	largeImageURL: string;
}

interface ResultProps {
	totalHits: number;
	hits: [ImageProps]
}

export async function getPixabayImages(params: ParamsProps): Promise<ResultProps>{
	if (!params){
		params = {};
	}

	params.key = publicRuntimeConfig.PIXABAY_API_KEY;
	params.image_type = 'photo';

	try {
		const url = 'https://pixabay.com/api/'
		const res = await axios.get(url, {
			params
		});

		return res.data as ResultProps;
	} catch (err){
		toast.error('Something went wrong. Try again in a few minutes!');
	}
}