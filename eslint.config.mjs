import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const config = [
	...nextCoreWebVitals,
	...nextTypescript,
	{
		ignores: [
			".next/**",
			"out/**",
			"build/**",
			"coverage/**",
			"next-env.d.ts",
			"**/*.test.ts",
			"**/*.test.tsx",
			"jest.setup.js",
			"jest.config.js",
		],
	},
];

export default config;
