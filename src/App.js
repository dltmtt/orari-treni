import React, { useState } from "react";
import axios from "./axios";
import Departures from "./components/Departures";

function App() {
	const [searchQuery, setStationQuery] = useState("");
	const [stationId, setStationId] = useState("");
	const [stationName, setStationName] = useState("");
	const [searchResults, setSearchResults] = useState([]);
	const [focusedIndex, setFocusedIndex] = useState(-1);

	const searchStation = async (query) => {
		if (query.trim() === "") {
			setSearchResults([]);
			return;
		}
		const response = await axios.get(`/stations/search/${query}`);
		setSearchResults(response.data);
		setFocusedIndex(-1);
	};

	const handleSelectStation = (station) => {
		setStationId(station.station_id);
		setStationName(station.name);
		setSearchResults([]);
		setStationQuery("");
		setFocusedIndex(-1);
	};

	const handleInputChange = (e) => {
		const query = e.target.value;
		setStationQuery(query);
		searchStation(query);
	};

	const navigateSearchResults = (e) => {
		if (e.key === "ArrowDown") {
			setFocusedIndex((prevIndex) => {
				const newIndex = Math.min(prevIndex + 1, searchResults.length - 1);
				setStationQuery(searchResults[newIndex]?.name || searchQuery);
				return newIndex;
			});
		} else if (e.key === "ArrowUp") {
			setFocusedIndex((prevIndex) => {
				const newIndex = Math.max(prevIndex - 1, 0);
				setStationQuery(searchResults[newIndex]?.name || searchQuery);
				return newIndex;
			});
		} else if (e.key === "Enter" && focusedIndex >= 0) {
			handleSelectStation(searchResults[focusedIndex]);
		}
	};

	return (
		<div className="container mx-auto p-4">
			<div className="flex items-center mb-4 p-4">
				<h1 className="text-3xl font-bold mr-4">Train Schedule</h1>
				<div className="flex-grow flex relative">
					<input
						value={searchQuery}
						onChange={handleInputChange}
						onKeyDown={navigateSearchResults}
						placeholder="Enter station name"
						className="border p-2 rounded-l-lg flex-grow shadow-sm"
					/>
					<button
						type="button"
						onClick={() => {
							searchStation(searchQuery);
							if (searchResults.length > 0) {
								handleSelectStation(searchResults[0]);
								setStationQuery("");
							}
						}}
						className="bg-blue-500 text-white p-2 rounded-r-lg shadow-sm"
					>
						Search
					</button>
					{searchResults.length > 0 && (
						<ul className="absolute top-full left-0 right-0 bg-white border mt-1 max-h-60 overflow-y-auto z-10 rounded-lg shadow-lg">
							{searchResults.map((station, index) => (
								<li
									key={station.station_id}
									onClick={() => handleSelectStation(station)}
									onKeyUp={(e) => {
										if (e.key === "Enter" || e.key === " ") {
											handleSelectStation(station);
										}
									}}
									className={`p-2 cursor-pointer hover:bg-gray-200 ${
										index === focusedIndex ? "bg-gray-200" : ""
									}`}
								>
									{station.name}
								</li>
							))}
						</ul>
					)}
				</div>
			</div>
			{stationId && (
				<Departures stationId={stationId} stationName={stationName} />
			)}
		</div>
	);
}

export default App;
