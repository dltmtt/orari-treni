import React, { useEffect, useState } from "react";
import axios from "../axios";
import { formatDelay, formatTime } from "../utils/utils";
import Departures from "./Departures";
import TrainInfo from "./TrainInfo";

function Arrivals({ stationId, stationName }) {
	const [arrivals, setArrivals] = useState([]);
	const [selectedStationId, setSelectedStationId] = useState(stationId);
	const [selectedStationName, setSelectedStationName] = useState(stationName);
	const [selectedTrain, setSelectedTrain] = useState(null);
	const [showDepartures, setShowDepartures] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		async function fetchArrivals() {
			setLoading(true);
			const response = await axios.get(
				`/stations/${selectedStationId}/arrivals`,
			);
			const detailedArrivals = await Promise.all(
				response.data.map(async (arrival) => {
					const trainProgress = await axios.get("/trains", {
						params: {
							origin_station_id: arrival.origin_station_id,
							train_number: arrival.number,
							departure_date: arrival.departure_date,
						},
					});
					return {
						...arrival,
						...trainProgress.data,
					};
				}),
			);
			setArrivals(detailedArrivals);
			setLoading(false);
		}
		fetchArrivals();
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

	const formatNumber = (arrival) => {
		let numbers = String(arrival.number);

		if (
			arrival.train_number_changes &&
			arrival.train_number_changes.length > 0
		) {
			numbers += "/";
			numbers += arrival.train_number_changes
				.map((c) => c.new_train_number)
				.join("/");
		}

		if (arrival.category) {
			return `${arrival.category} ${numbers}`;
		}

		return numbers;
	};

	const formatTrack = (arrival) => {
		const station = arrival.stops?.find(
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

		const origin = arrival.stops[0];
		const arrivalStop = arrival.stops[arrival.stops.length - 1];

		if (
			(station.arrived || origin.actual_departure_time) &&
			(station.departed || arrivalStop.actual_arrival_time)
		) {
			formattedTrack = <span style={{ color: "gray" }}>{formattedTrack}</span>;
		} else if (station.arrived && !station.departed) {
			formattedTrack = (
				<span style={{ animation: "blink 1s step-start infinite" }}>{formattedTrack}</span>
			);
		}

		return formattedTrack || "N/A";
	};

	const formatArrivalTime = (arrival) => {
		const station = arrival.stops?.find(
			(s) => s.station_id === selectedStationId,
		);
		return station ? formatTime(station.scheduled_arrival_time) : "N/A";
	};

	if (showDepartures) {
		return (
			<Departures
				stationId={selectedStationId}
				stationName={selectedStationName}
				onToggleView={() => setShowDepartures(false)}
			/>
		);
	}

	return (
		<div className="p-4 shadow-lg rounded-lg">
			<h2
				className="text-2xl font-bold mb-4 cursor-pointer rounded-lg p-2"
				onClick={() => setShowDepartures(true)}
				onKeyUp={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						setShowDepartures(true);
					}
				}}
			>
				Arrivals at {selectedStationName}
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
								<th className="py-2 px-4 border">Origin</th>
								<th className="py-2 px-4 border">Arrival</th>
								<th className="py-2 px-4 border">Delay</th>
								<th className="py-2 px-4 border rounded-tr-lg">Track</th>
							</tr>
						</thead>
						<tbody>
							{arrivals.map((arrival, index) => (
								<tr
									key={`${arrival.number}-${arrival.origin_station_id}-${arrival.departure_date}`}
								>
									<td
										className={`py-2 px-4 border ${
											index === arrivals.length - 1 ? "rounded-bl-lg" : ""
										}`}
									>
										<span
											className="text-blue-500 cursor-pointer"
											onClick={() =>
												handleTrainClick(
													arrival.number,
													arrival.origin_station_id,
													arrival.departure_date,
												)
											}
											onKeyUp={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													handleTrainClick(
														arrival.number,
														arrival.origin_station_id,
														arrival.departure_date,
													);
												}
											}}
										>
											{formatNumber(arrival)}
										</span>
									</td>
									<td className="py-2 px-4 border">
										<span
											className="text-blue-500 cursor-pointer"
											onClick={() =>
												handleStationClick(
													arrival.origin_station_id,
													arrival.origin,
												)
											}
											onKeyUp={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													handleStationClick(
														arrival.origin_station_id,
														arrival.origin,
													);
												}
											}}
										>
											{arrival.origin}
										</span>
									</td>
									<td className="py-2 px-4 border">
										{formatArrivalTime(arrival)}
									</td>
									<td className="py-2 px-4 border">{formatDelay(arrival)}</td>
									<td
										className={`py-2 px-4 border ${
											index === arrivals.length - 1 ? "rounded-br-lg" : ""
										}`}
									>
										{formatTrack(arrival)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				)}
		</div>
	);
}

const styles = `
@keyframes blink {
	50% {
		opacity: 0;
	}
}
`;
document.head.insertAdjacentHTML("beforeend", `<style>${styles}</style>`);

export default Arrivals;
