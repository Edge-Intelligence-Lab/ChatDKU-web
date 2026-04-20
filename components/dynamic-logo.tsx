"use client";

import Image from "next/image";

interface DynamicLogoProps {
	width?: number;
	height?: number;
}

const DynamicLogo: React.FC<DynamicLogoProps> = ({
	width = 96,
	height = 96,
}) => (
	<div className="relative">
		<Image
			src="/logos/new_logo.svg"
			alt="Logo"
			className="relative"
			width={width}
			height={height}
			priority
			unoptimized
			loading="eager"
		/>
	</div>
);

export default DynamicLogo;
