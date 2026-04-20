"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type SubItem = {
	name: string;
	description: string;
	hours?: string;
	location: string;
	image?: string;
	introduction?: string;
};

type Marker = {
	id: number;
	type: "building" | "office" | "printer";
	top: number;
	left: number;
	items: SubItem[];
};

type ExtraOfficeItem = SubItem & { id: string };

const useIsMobile = () => {
	const [isMobile, setIsMobile] = useState(false);
	useEffect(() => {
		const check = () => setIsMobile(window.innerWidth <= 768);
		check();
		window.addEventListener("resize", check);
		return () => window.removeEventListener("resize", check);
	}, []);
	return isMobile;
};

const MapModal = ({
	marker,
	itemIndex,
	mapImage,
	onClose,
}: {
	marker: Marker;
	itemIndex: number;
	mapImage: string;
	onClose: () => void;
}) => {
	const item = marker.items[itemIndex];
	const leftPercent = (marker.left / 1000) * 100;
	const topPercent = (marker.top / 650) * 100;

	return (
		<div
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
			onClick={onClose}
		>
			<div
				className="relative bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden"
				style={{ width: "min(90vw, 500px)" }}
				onClick={(e) => e.stopPropagation()}
			>
				<Button
					variant="ghost"
					size="icon"
					onClick={onClose}
					className="absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-black/70 dark:bg-white/70 text-white dark:text-black hover:bg-black dark:hover:bg-white"
				>
					✕
				</Button>
				<div className="relative w-full" style={{ aspectRatio: "1000 / 650" }}>
					<img
						src={mapImage}
						className="absolute inset-0 w-full h-full object-cover"
						alt="map"
					/>
					<div
						className="absolute -translate-x-1/2 -translate-y-full cursor-pointer"
						style={{ left: `${leftPercent}%`, top: `${topPercent}%` }}
					>
						<img
							src="/pointer.png"
							className="w-10 h-10 drop-shadow-lg"
							alt="marker"
						/>
					</div>
				</div>
				<div className="p-3 text-center text-neutral-800 dark:text-neutral-200">
					<div className="font-semibold">{item.name}</div>
					<div className="text-sm text-neutral-600 dark:text-neutral-400">
						{item.location}
					</div>
				</div>
			</div>
		</div>
	);
};

type MarkerType = "building" | "office" | "printer";

function FilterButtons({
	selectedType,
	onSelect,
}: {
	selectedType: MarkerType;
	onSelect: (type: MarkerType) => void;
}) {
	return (
		<div className="flex flex-row md:flex-col gap-3 md:gap-4 justify-center md:justify-start mt-2 md:mt-6">
			{(["building", "office", "printer"] as const).map((type) => (
				<Button
					key={type}
					variant={selectedType === type ? "default" : "secondary"}
					className="rounded-xl text-sm md:text-base px-3 md:px-4 py-1.5 md:py-2"
					onClick={() => onSelect(type)}
				>
					{type === "building"
						? "Buildings"
						: type === "office"
							? "Offices"
							: "Printers"}
				</Button>
			))}
		</div>
	);
}

export default function CampusMap({
	onAsk,
}: {
	onAsk: (reference: string) => void;
}) {
	const [selectedType, setSelectedType] = useState<
		"building" | "office" | "printer"
	>("building");
	const [markers, setMarkers] = useState<Marker[]>([]);
	const [extraOfficeItems, setExtraOfficeItems] = useState<ExtraOfficeItem[]>(
		[],
	);
	const [selectedMarker, setSelectedMarker] = useState<Marker | null>(null);
	const [currentIndex, setCurrentIndex] = useState(0);
	const [mapImage, setMapImage] = useState("/mapupdate.png");
	const [viewMode, setViewMode] = useState<"map" | "list">("map");
	const [modalMarker, setModalMarker] = useState<{
		marker: Marker;
		itemIndex: number;
	} | null>(null);
	const isMobile = useIsMobile();
	const panelContentRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		fetch(`/api/campus-map?type=${selectedType}`)
			.then((res) => res.json())
			.then((data) => {
				setMarkers(data.markers);
				setExtraOfficeItems(data.extraOfficeItems);
			});
	}, [selectedType]);

	useEffect(() => {
		// eslint-disable-next-line react-hooks/set-state-in-effect -- switch to list view on mobile transitions
		if (isMobile) setViewMode("list");
	}, [isMobile]);

	useEffect(() => {
		const updateMapImage = () => {
			const isDark = document.documentElement.classList.contains("dark");
			setMapImage(isDark ? "/dark.png" : "/mapupdate.png");
		};
		updateMapImage();
		const observer = new MutationObserver(updateMapImage);
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (panelContentRef.current) {
			panelContentRef.current.scrollTop = 0;
		}
	}, [currentIndex]);

	const filteredMarkers = markers;
	const isBottomHalf = selectedMarker && selectedMarker.top > 350;

	type ListItem = SubItem & {
		markerId: number;
		markerType: Marker["type"];
		itemIndex: number;
		id?: string;
	};
	let finalListItems: ListItem[] = [];

	if (selectedType === "building" || selectedType === "printer") {
		finalListItems = filteredMarkers.flatMap((marker) =>
			marker.items.map((item, idx) => ({
				...item,
				markerId: marker.id,
				markerType: marker.type,
				itemIndex: idx,
			})),
		);
	} else if (selectedType === "office") {
		const officeItems = filteredMarkers.flatMap((marker) =>
			marker.items.map((item, idx) => ({
				...item,
				markerId: marker.id,
				markerType: marker.type,
				itemIndex: idx,
			})),
		);
		const extraItems = extraOfficeItems.map((item) => ({
			...item,
			markerId: -1,
			markerType: "office" as const,
			itemIndex: -1,
		}));
		const allOffices = [...officeItems, ...extraItems];
		allOffices.sort((a, b) => a.name.localeCompare(b.name));
		finalListItems = allOffices;
	}

	const handleViewOnMap = (markerId: number, itemIndex: number) => {
		if (markerId === -1) return;
		const targetMarker = markers.find((m) => m.id === markerId);
		if (!targetMarker) return;
		if (isMobile) {
			setModalMarker({ marker: targetMarker, itemIndex });
		} else {
			setViewMode("map");
			setSelectedMarker(targetMarker);
			setCurrentIndex(itemIndex);
		}
	};


	return (
		<>
			<div className="w-full flex justify-center items-start p-4 md:p-8">
				<div className="flex flex-col md:flex-row gap-4 md:gap-8 w-full max-w-7xl mx-auto justify-center">
					{isMobile && <FilterButtons
							selectedType={selectedType}
							onSelect={(type) => {
								setSelectedType(type);
								setSelectedMarker(null);
								setCurrentIndex(0);
							}}
						/>}

					<div className="relative w-full md:w-[1000px] h-[500px] md:h-[650px]">
						{!isMobile && (
							<div className="absolute top-3 left-3 z-20 flex gap-2 bg-white/80 dark:bg-neutral-800/80 backdrop-blur-sm rounded-full p-1 shadow-md border">
								<Button
									variant={viewMode === "map" ? "default" : "ghost"}
									className="rounded-full px-3 py-1.5 text-sm font-medium"
									onClick={() => setViewMode("map")}
								>
									Map
								</Button>
								<Button
									variant={viewMode === "list" ? "default" : "ghost"}
									className="rounded-full px-3 py-1.5 text-sm font-medium"
									onClick={() => setViewMode("list")}
								>
									List
								</Button>
							</div>
						)}

						{!isMobile && viewMode === "map" && (
							<div
								className="relative w-full h-full"
								onClick={() => setSelectedMarker(null)}
							>
								<div className="absolute inset-0 rounded-3xl overflow-hidden shadow-xl border">
									<img src={mapImage} className="w-full h-full object-cover" />
								</div>
								<div className="absolute inset-0">
									{filteredMarkers.map((marker) => (
										<div
											key={marker.id}
											className="absolute -translate-x-1/2 -translate-y-full z-10 group cursor-pointer"
											style={{ top: marker.top, left: marker.left }}
											onClick={(e) => {
												e.stopPropagation();
												setSelectedMarker(marker);
												setCurrentIndex(0);
											}}
										>
											<img
												src="/pointer.png"
												className="relative w-10 md:w-15 h-10 md:h-15 drop-shadow-lg transition-all duration-200 group-hover:-translate-y-1 group-hover:scale-110"
											/>
										</div>
									))}
									{selectedMarker && (
										<div
											className="absolute z-50 w-[280px] md:w-[320px] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col"
											style={{
												top: isBottomHalf
													? selectedMarker.top - 260
													: selectedMarker.top,
												left: selectedMarker.left + 40,
												maxHeight: "80vh",
											}}
											onClick={(e) => e.stopPropagation()}
										>
											<Button
												variant="ghost"
												size="icon"
												onClick={() => setSelectedMarker(null)}
												className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/70 dark:bg-white/70 text-white dark:text-black hover:bg-black dark:hover:bg-white z-10"
											>
												✕
											</Button>
											<div
												ref={panelContentRef}
												className="flex-1 overflow-y-auto"
											>
												{selectedMarker.items[currentIndex].image && (
													<img
														src={selectedMarker.items[currentIndex].image}
														className="w-full h-32 object-cover"
													/>
												)}
												<div
													className={`p-4 ${selectedMarker.items[currentIndex].image ? "pb-2" : ""}`}
												>
													<div className="font-semibold text-lg">
														{selectedMarker.items[currentIndex].name}
													</div>
													<div className="text-sm text-neutral-600 dark:text-neutral-400">
														{selectedMarker.items[currentIndex].description}
													</div>
													{selectedMarker.items[currentIndex].introduction && (
														<div className="mt-1 text-xs italic text-neutral-500 dark:text-neutral-400">
															{selectedMarker.items[currentIndex].introduction}
														</div>
													)}
													<div className="mt-4 text-sm space-y-1">
														{selectedMarker.items[currentIndex].hours && (
															<div>
																<span className="font-medium">Open Hours:</span>{" "}
																{selectedMarker.items[currentIndex].hours}
															</div>
														)}
														<div className="whitespace-pre-line break-words">
															<span className="font-medium">Location:</span>{" "}
															{selectedMarker.items[currentIndex].location}
														</div>
													</div>
													<Button
														className="mt-4 w-full rounded-lg"
														onClick={() =>
															onAsk(
																`About ${selectedMarker!.items[currentIndex].name}`,
															)
														}
													>
														Ask ChatDKU about this
													</Button>
												</div>
											</div>
											{selectedMarker.items.length > 1 && (
												<div className="flex items-center justify-center gap-4 py-2">
													<Button
														variant="ghost"
														size="icon"
														disabled={currentIndex === 0}
														onClick={() => setCurrentIndex((p) => p - 1)}
														className="w-8 h-8 rounded-full"
													>
														&#8249;
													</Button>
													<div className="text-sm text-neutral-600 dark:text-neutral-400">
														{currentIndex + 1} / {selectedMarker.items.length}
													</div>
													<Button
														variant="ghost"
														size="icon"
														disabled={
															currentIndex === selectedMarker.items.length - 1
														}
														onClick={() => setCurrentIndex((p) => p + 1)}
														className="w-8 h-8 rounded-full"
													>
														&#8250;
													</Button>
												</div>
											)}
										</div>
									)}
								</div>
							</div>
						)}

						{(viewMode === "list" || isMobile) && (
							<div className="w-full h-full rounded-3xl overflow-y-auto bg-white dark:bg-neutral-900 shadow-xl border">
								<div className="pt-14 px-3 md:px-4 pb-4">
									<div className="space-y-3 md:space-y-4">
										{finalListItems.length === 0 ? (
											<div className="text-center text-neutral-500 dark:text-neutral-400 py-10">
												No {selectedType} available.
											</div>
										) : (
											finalListItems.map((item, idx) => {
												const isBuilding = item.markerType === "building";
												const isOfficeOrPrinter =
													item.markerType === "office" ||
													item.markerType === "printer";
												const hasMapMarker = item.markerId !== -1;

												return (
													<div
														key={`${item.markerId}-${idx}`}
														className="bg-neutral-50 dark:bg-neutral-800 rounded-xl p-3 md:p-4 shadow-sm"
													>
														{item.image && item.markerType !== "office" && (
															<img
																src={item.image}
																alt={item.name}
																className="w-full h-28 md:h-32 object-cover rounded-lg mb-3"
															/>
														)}
														{isBuilding ? (
															<>
																<div>
																	<div className="font-semibold text-base md:text-lg">
																		{item.name}
																	</div>
																	<div className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
																		{item.description}
																	</div>
																	<div className="mt-2 md:mt-3 text-xs md:text-sm space-y-1">
																		{item.hours && (
																			<div>
																				<span className="font-medium">
																					Open Hours:
																				</span>{" "}
																				{item.hours}
																			</div>
																		)}
																		<div className="whitespace-pre-line break-words">
																			<span className="font-medium">
																				Location:
																			</span>{" "}
																			{item.location}
																		</div>
																	</div>
																</div>
																<Button
																	className="mt-3 md:mt-4 w-full rounded-lg text-sm"
																	onClick={() =>
																		handleViewOnMap(
																			item.markerId,
																			item.itemIndex,
																		)
																	}
																>
																	View on the map
																</Button>
															</>
														) : isOfficeOrPrinter ? (
															<div className="flex flex-col sm:flex-row gap-3">
																<div className="flex-1 min-w-0 break-words">
																	<div className="font-semibold text-base md:text-lg">
																		{item.name}
																	</div>
																	<div className="text-xs md:text-sm text-neutral-600 dark:text-neutral-400 mt-1">
																		{item.description}
																	</div>
																	{item.introduction && (
																		<div className="mt-1 text-xs italic text-neutral-500 dark:text-neutral-400">
																			{item.introduction}
																		</div>
																	)}
																	<div className="mt-2 md:mt-3 text-xs md:text-sm space-y-1">
																		{item.hours && (
																			<div>
																				<span className="font-medium">
																					Open Hours:
																				</span>{" "}
																				{item.hours}
																			</div>
																		)}
																		{hasMapMarker && item.location && (
																			<div className="whitespace-pre-line break-words">
																				<span className="font-medium">
																					Location:
																				</span>{" "}
																				{item.location}
																			</div>
																		)}
																	</div>
																</div>
																<div className="flex flex-row sm:flex-col justify-start sm:justify-center gap-2 sm:gap-3 flex-shrink-0">
																	<Button
																		className="rounded-lg text-xs md:text-sm"
																		onClick={() => onAsk(`About ${item.name}`)}
																	>
																		Ask ChatDKU
																	</Button>
																	{hasMapMarker && (
																		<Button
																			variant="secondary"
																			className="rounded-lg text-xs md:text-sm"
																			onClick={() =>
																				handleViewOnMap(
																					item.markerId,
																					item.itemIndex,
																				)
																			}
																		>
																			View on map
																		</Button>
																	)}
																</div>
															</div>
														) : null}
													</div>
												);
											})
										)}
									</div>
								</div>
							</div>
						)}
					</div>

					{!isMobile && <FilterButtons
							selectedType={selectedType}
							onSelect={(type) => {
								setSelectedType(type);
								setSelectedMarker(null);
								setCurrentIndex(0);
							}}
						/>}
				</div>
			</div>

			{isMobile && modalMarker && (
				<MapModal
					marker={modalMarker.marker}
					itemIndex={modalMarker.itemIndex}
					mapImage={mapImage}
					onClose={() => setModalMarker(null)}
				/>
			)}
		</>
	);
}
