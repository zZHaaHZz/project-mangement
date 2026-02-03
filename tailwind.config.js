/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: '#FF4081',
                secondary: {
                    dark: '#1f2937', // gray-800
                    DEFAULT: '#4b5563', // gray-600
                },
                background: {
                    light: '#f3f4f6', // gray-100
                    dark: '#111827', // gray-900
                },
                accent: {
                    text: '#9ca3af', // gray-400
                }
            },
        },
    },
    plugins: [],
}
