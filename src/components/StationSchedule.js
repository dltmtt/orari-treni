import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { formatDelay, formatIsoTime } from "../utils/utils";
import TrainInfo from "./TrainInfo";

function TrainSchedule({
	stationId,
	stationName,
	apiEndpoint,
	toggleViewComponent: ToggleViewComponent,
}) {
	const [stationSchedule, setStationSchedule] = useState([]);
	const [selectedStationId, setSelectedStationId] = useState(stationId);
	const [selectedStationName, setSelectedStationName] = useState(stationName);
	const [selectedTrain, setSelectedTrain] = useState(null);
	const [showToggleView, setShowToggleView] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		async function fetchData() {
			setLoading(true);
			const response = await axios.get(
				`/stations/${selectedStationId}/${apiEndpoint}`,
			);
			const detailedData = await Promise.all(
				response.data.map(async (item) => {
					const trainProgress = await axios.get("/trains", {
						params: {
							origin_station_id: item.origin_station_id,
							train_number: item.number,
							departure_date: item.departure_date,
						},
					});
					return {
						...item,
						...trainProgress.data,
					};
				}),
			);
			setStationSchedule(detailedData);
			setLoading(false);
		}
		fetchData();
	}, [selectedStationId, apiEndpoint]);

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

	const formatNumber = (train) => {
		let numbers = String(train.number);

		if (train.train_number_changes && train.train_number_changes.length > 0) {
			numbers += "/";
			numbers += train.train_number_changes
				.map((c) => c.new_train_number)
				.join("/");
		}

		if (train.category) {
			return `${train.category} ${numbers}`;
		}

		return numbers;
	};

	const formatTime = (train) => {
		const station = train.stops?.find(
			(s) => s.station_id === selectedStationId,
		);
		if (!station) return "N/A";
		return apiEndpoint === "departures"
			? formatIsoTime(station.scheduled_departure_time)
			: formatIsoTime(station.scheduled_arrival_time);
	};

	const formatTrack = (train) => {
		if (!train.stops) {
			return "Non sono disponibili aggiornamenti in tempo reale";
		}

		const station = train.stops.find(
			(s) => s.station_id === selectedStationId,
		);

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

		const origin = train.stops.find((stop) => stop.type === "departure");
		const arrival = train.stops.find((stop) => stop.type === "arrival");

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

	if (showToggleView) {
		return (
			<ToggleViewComponent
				stationId={selectedStationId}
				stationName={selectedStationName}
				onToggleView={() => setShowToggleView(false)}
			/>
		);
	}

	return (
		<div className="p-4 shadow-lg rounded-lg">
			<h2
				className="text-2xl font-bold mb-4 cursor-pointer rounded-lg p-2"
				onClick={() => setShowToggleView(true)}
				onKeyUp={(e) => {
					if (e.key === "Enter" || e.key === " ") {
						setShowToggleView(true);
					}
				}}
			>
				{apiEndpoint === "departures" ? "Partenze da" : "Arrivi a"}{" "}
				{selectedStationName}
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
				<div className="overflow-x-auto">
					<table className="min-w-full bg-white border rounded-lg shadow-md">
						<thead>
							<tr>
								<th className="py-2 px-4 border rounded-tl-lg">Treno</th>
								<th className="py-2 px-4 border">
									{apiEndpoint === "departures" ? "Destinazione" : "Provenienza"}
								</th>
								<th className="py-2 px-4 border">
									{apiEndpoint === "departures" ? "Partenza" : "Arrivo"}
								</th>
								<th className="py-2 px-4 border">Ritardo</th>
								<th className="py-2 px-4 border rounded-tr-lg">Binario</th>
							</tr>
						</thead>
						<tbody>
							{stationSchedule.map((train, index) => (
								<tr
									key={`${train.number}-${train.origin_station_id}-${train.departure_date}`}
								>
									<td
										className={`py-2 px-4 border ${
											index === stationSchedule.length - 1 ? "rounded-bl-lg" : ""
										}`}
									>
										<span
											className="text-blue-500 cursor-pointer"
											onClick={() =>
												handleTrainClick(
													train.number,
													train.origin_station_id,
													train.departure_date,
												)
											}
											onKeyUp={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													handleTrainClick(
														train.number,
														train.origin_station_id,
														train.departure_date,
													);
												}
											}}
										>
											{formatNumber(train)}
										</span>
									</td>
									<td className="py-2 px-4 border">
										<span
											className="text-blue-500 cursor-pointer"
											onClick={() => {
												const stationId =
													apiEndpoint === "departures"
														? train.destination_station_id
														: train.origin_station_id;
												const stationName =
													apiEndpoint === "departures"
														? train.destination
														: train.origin;
												handleStationClick(stationId, stationName);
											}}
											onKeyUp={(e) => {
												if (e.key === "Enter" || e.key === " ") {
													const stationId =
														apiEndpoint === "departures"
															? train.destination_station_id
															: train.origin_station_id;
													const stationName =
														apiEndpoint === "departures"
															? train.destination
															: train.origin;
													handleStationClick(stationId, stationName);
												}
											}}
										>
											{apiEndpoint === "departures"
												? train.destination
												: train.origin}
										</span>
									</td>
									<td className="py-2 px-4 border">{formatTime(train)}</td>
									<td className="py-2 px-4 border">{formatDelay(train)}</td>
									<td
										className={`py-2 px-4 border ${
											index === stationSchedule.length - 1 ? "rounded-br-lg" : ""
										}`}
									>
										{formatTrack(train)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</div>
	);
}

export default TrainSchedule;
