const defaultPreviews = [
	{
		id: 'preview_image_1',
		metatype: 'image',
		src: 'https://konvajs.org/assets/lion.png',
		x: 0,
		y: 0,
	},
	{
		id: 'preview_image_2',
		metatype: 'image',
		src: 'https://static01.nyt.com/images/2021/09/14/science/07CAT-STRIPES/07CAT-STRIPES-mediumSquareAt3X-v2.jpg',
		x: 0,
		y: 0,
	},

	{
		id: 'preview_text_1',
		metatype: 'text',
		text: 'Heading 1',
		fontSize: 32,
		fontStyle: 'bold',
	},
	{
		id: 'preview_text_2',
		metatype: 'text',
		text: 'Heading 2',
		fontSize: 26,
		fontStyle: 'bold',
	},
	{
		id: 'preview_text_3',
		metatype: 'text',
		text: 'Heading 3',
		fontSize: 22,
		fontStyle: 'bold',
	},
	{
		id: 'preview_text_4',
		metatype: 'text',
		text: 'Normal text',
		fontSize: 16,
	},

	{
		id: 'preview_rect_1',
		metatype: 'rectangle',
		fill: '#73777B',
		width: 100,
		height: 100,
	},

	{
		id: 'preview_template_1',
		metatype: 'template',
		elements: [
			{
				id: 'preview_rect_1',
				metatype: 'rectangle',
				fill: '#73777B',
				width: 100,
				height: 100,
				x: 10,
				y: 20,
			},
			{
				id: 'preview_text_3',
				metatype: 'text',
				text: 'Milo',
				fontSize: 22,
				fontStyle: 'bold',
				x: 15,
				y: 30,
			},
			{
				id: 'preview_image_1',
				metatype: 'image',
				src: 'https://static01.nyt.com/images/2021/09/14/science/07CAT-STRIPES/07CAT-STRIPES-mediumSquareAt3X-v2.jpg',
				x: 30,
				y: 60,
				width: 50,
				height: 50,
			},
		],
	},
];

module.exports = defaultPreviews;
