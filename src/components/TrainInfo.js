import React, { useEffect, useState } from "react";
import axios from "../axios";
import { formatDelay, formatTime, getFormattedTime } from "../utils/utils";

function TrainInfo({
	trainNumber,
	originStationId,
	departureDate,
	onClose,
	onStationClick,
}) {
	const [trainInfo, setTrainInfo] = useState(null);

	useEffect(() => {
		async function fetchTrainInfo() {
			const response = await axios.get("/trains", {
				params: {
					train_number: trainNumber,
					origin_station_id: originStationId,
					departure_date: departureDate,
				},
			});
			setTrainInfo(response.data);
		}
		fetchTrainInfo();
	}, [trainNumber, originStationId, departureDate]);

	if (!trainInfo) {
		return (
			<div className="p-4 bg-gray-100 border rounded">
				<button type="button" onClick={onClose} className="mb-4 text-red-500">
					Close
				</button>
				<div>No data available</div>
			</div>
		);
	}

	return (
		<div className="p-4 bg-gray-100 border rounded">
			<button type="button" onClick={onClose} className="mb-4 text-red-500">
				Close
			</button>
			<h3 className="text-xl font-bold mb-2">Train {trainNumber}</h3>
			<p>
				{trainInfo.origin} · {formatTime(trainInfo.departure_time)}
			</p>
			<p>
				{trainInfo.destination} · {formatTime(trainInfo.arrival_time)}
			</p>
			<p>Ritardo: {formatDelay(trainInfo)}</p>
			<div className="overflow-y-auto max-h-64 mt-4">
				<table className="min-w-full bg-white border">
					<thead>
						<tr>
							<th className="py-2 px-4 border">Station</th>
							<th className="py-2 px-4 border">Scheduled Departure</th>
							<th className="py-2 px-4 border">Actual Departure</th>
							<th className="py-2 px-4 border">Scheduled Arrival</th>
							<th className="py-2 px-4 border">Actual Arrival</th>
							<th className="py-2 px-4 border">Scheduled Track</th>
							<th className="py-2 px-4 border">Actual Track</th>
						</tr>
					</thead>
					<tbody>
						{trainInfo.stops.map((stop, index) => (
							<tr key={stop.station_id}>
								<td className="py-2 px-4 border">
									<span
										className="text-blue-500 cursor-pointer"
										onClick={() => {
											onStationClick(stop.station_id, stop.name);
											onClose();
										}}
										onKeyUp={(e) => {
											if (e.key === "Enter" || e.key === " ") {
												onStationClick(stop.station_id, stop.name);
												onClose();
											}
										}}
									>
										{stop.name}
									</span>
								</td>
								{index !== 0 && (
									<>
										<td className="py-2 px-4 border">
											{formatTime(stop.scheduled_departure_time)}
										</td>
										<td className="py-2 px-4 border">
											{stop.actual_departure_time
												? getFormattedTime(stop, {
														checkDepartures: true,
													})
												: "N/A"}
										</td>
									</>
								)}
								{index === 0 && (
									<td className="py-2 px-4 border" colSpan="2">
										Origin Station
									</td>
								)}
								{index !== trainInfo.stops.length - 1 && (
									<>
										<td className="py-2 px-4 border">
											{formatTime(stop.scheduled_arrival_time)}
										</td>
										<td className="py-2 px-4 border">
											{stop.actual_arrival_time
												? getFormattedTime(stop, {
														checkDepartures: false,
													})
												: "N/A"}
										</td>
									</>
								)}
								{index === trainInfo.stops.length - 1 && (
									<td className="py-2 px-4 border" colSpan="2">
										Destination Station
									</td>
								)}
								<td className="py-2 px-4 border">
									{stop.scheduled_departure_track || "N/A"}
								</td>
								<td className="py-2 px-4 border">
									{stop.actual_departure_track || "N/A"}
								</td>
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default TrainInfo;
