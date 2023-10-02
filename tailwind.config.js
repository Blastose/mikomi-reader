/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				dark: {
					100: '#2f2e31',
					500: '#2b2b2b'
				},
				primary: {
					100: '#eeedf3',
					500: '#ffffff'
				}
			}
		}
	},
	plugins: [require('@tailwindcss/container-queries')]
};
