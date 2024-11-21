import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { formatDelay, formatTime } from "../utils/utils";
import Arrivals from "./Arrivals";
import TrainInfo from "./TrainInfo";

function Departures({ stationId, stationName }) {
	const [departures, setDepartures] = useState([]);
	const [selectedStationId, setSelectedStationId] = useState(stationId);
	const [selectedStationName, setSelectedStationName] = useState(stationName);
	const [selectedTrain, setSelectedTrain] = useState(null);
	const [showArrivals, setShowArrivals] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		async function fetchDepartures() {
			setLoading(true);
			const response = await axios.get(
				`/stations/${selectedStationId}/departures`,
			);
			const detailedDepartures = await Promise.all(
				response.data.map(async (departure) => {
					const trainProgress = await axios.get("/trains", {
						params: {
							origin_station_id: departure.origin_station_id,
							train_number: departure.number,
							departure_date: departure.departure_date,
						},
					});
					return {
						...departure,
						...trainProgress.data,
					};
				}),
			);
			setDepartures(detailedDepartures);
			setLoading(false);
		}
		fetchDepartures();
	}, [selectedStationId]);

	useEffect(() => {
		setSelectedStationId(stationId);
		setSelectedStationName(stationName);
	}, [stationId, stationName]);

	const handleStationClick = (stationId, stationName) => {
		setSelectedStationId(stationId);
		setSelectedStationName(stationName);
	};

	const handleTrainClick = (trainNumber, originStationId, departureDate) => {
		setSelectedTrain({ trainNumber, originStationId, departureDate });
	};

	const formatNumber = (departure) => {
		let numbers = String(departure.number);

		if (
			departure.train_number_changes &&
			departure.train_number_changes.length > 0
		) {
			numbers += "/";
			numbers += departure.train_number_changes
				.map((c) => c.new_train_number)
				.join("/");
		}

		if (departure.category) {
			return `${departure.category} ${numbers}`;
		}

		return numbers;
	};

	const formatTrack = (departure) => {
		const station = departure.stops?.find(
			(s) => s.station_id === selectedStationId,
		);

		if (!station) {
			return "Error finding station ID";
		}

		const track =
			station.actual_departure_track || station.actual_arrival_track;
		const scheduledTrack =
			station.scheduled_departure_track || station.scheduled_arrival_track;

		let formattedTrack = track;

		if (track) {
			if (track === scheduledTrack) {
				formattedTrack = <span style={{ color: "blue" }}>{track}</span>;
			} else if (scheduledTrack) {
				formattedTrack = <span style={{ color: "magenta" }}>{track}</span>;
			} else {
				formattedTrack = <span style={{ color: "cyan" }}>{track}</span>;
			}
		} else {
			formattedTrack = scheduledTrack;
		}

		const origin = departure.stops[0];
		const arrival = departure.stops[departure.stops.length - 1];

		if (
			(station.arrived || origin.actual_departure_time) &&
			(station.departed || arrival.actual_arrival_time)
		) {
			formattedTrack = <span style={{ color: "gray" }}>{formattedTrack}</span>;
		} else if (station.arrived && !station.departed) {
			formattedTrack = (
				<span style={{ animation: "blink 1s step-start infinite" }}>
					{formattedTrack}
				</span>
			);
		}

		return formattedTrack || "N/A";
	};

	const formatDepartureTime = (departure) => {
		const station = departure.stops?.find(
			(s) => s.station_id === selectedStationId,
		);
		return station ? formatTime(station.scheduled_departure_time) : "N/A";
	};

	if (showArrivals) {
		return (
			<Arrivals
				stationId={selectedStationId}
				stationName={selectedStationName}
				onToggleView={() => setShowArrivals(false)}
			/>
		);
	}

	return (
		<div className="p-4 shadow-lg rounded-lg">
			<h2
				className="text-2xl font-bold mb-4 cursor-pointer rounded-lg p-2"
				onClick={() => setShowArrivals(true)}
				onKeyUp={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						setShowArrivals(true);
					}
				}}
			>
				Departures from {selectedStationName}
			</h2>
			{selectedTrain && (
				<TrainInfo
					trainNumber={selectedTrain.trainNumber}
					originStationId={selectedTrain.originStationId}
					departureDate={selectedTrain.departureDate}
					onClose={() => setSelectedTrain(null)}
					onStationClick={handleStationClick}
				/>
			)}
			{showArrivals ? (
				<Arrivals
					stationId={selectedStationId}
					stationName={selectedStationName}
				/>
			) : (
				<>
					{loading ? (
						<div>Loading...</div>
					) : (
						<table
							className="min-w-full bg-white border rounded-lg shadow-md"
							style={{ borderCollapse: "separate", borderSpacing: 0 }}
						>
							<thead>
								<tr>
									<th className="py-2 px-4 border rounded-tl-lg">Train</th>
									<th className="py-2 px-4 border">Destination</th>
									<th className="py-2 px-4 border">Departure</th>
									<th className="py-2 px-4 border">Delay</th>
									<th className="py-2 px-4 border rounded-tr-lg">Track</th>
								</tr>
							</thead>
							<tbody>
								{departures.map((departure, index) => (
									<tr
										key={`${departure.number}-${departure.origin_station_id}-${departure.departure_date}`}
									>
										<td
											className={`py-2 px-4 border ${
												index === departures.length - 1 ? "rounded-bl-lg" : ""
											}`}
										>
											<span
												className="text-blue-500 cursor-pointer"
												onClick={() =>
													handleTrainClick(
														departure.number,
														departure.origin_station_id,
														departure.departure_date,
													)
												}
												onKeyUp={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														handleTrainClick(
															departure.number,
															departure.origin_station_id,
															departure.departure_date,
														);
													}
												}}
											>
												{formatNumber(departure)}
											</span>
										</td>
										<td className="py-2 px-4 border">
											<span
												className="text-blue-500 cursor-pointer"
												onClick={() =>
													handleStationClick(
														departure.destination_station_id,
														departure.destination,
													)
												}
												onKeyUp={(e) => {
													if (e.key === "Enter" || e.key === " ") {
														handleStationClick(
															departure.destination_station_id,
															departure.destination,
														);
													}
												}}
											>
												{departure.destination}
											</span>
										</td>
										<td className="py-2 px-4 border">
											{formatDepartureTime(departure)}
										</td>
										<td className="py-2 px-4 border">
											{formatDelay(departure)}
										</td>
										<td
											className={`py-2 px-4 border ${
												index === departures.length - 1 ? "rounded-br-lg" : ""
											}`}
										>
											{formatTrack(departure)}
										</td>
									</tr>
								))}
							</tbody>
						</table>
					)}
				</>
			)}
		</div>
	);
}

export default Departures;
