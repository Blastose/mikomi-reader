/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	darkMode: 'class',
	theme: {
		extend: {
			colors: {
				dark: {
					100: '#2f2e31',
					500: '#242424'
				},
				primary: {
					500: '#5e5d6d'
				}
			}
		}
	},
	plugins: [require('@tailwindcss/container-queries')]
};
