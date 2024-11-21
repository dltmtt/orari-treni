import React, { useEffect, useState } from "react";
import axios from "../utils/axios";
import { formatDelay, formatIsoTime, getFormattedTime } from "../utils/utils";

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
					Chiudi
				</button>
				<div>Caricamento…</div>
			</div>
		);
	}

	const formatTrack = (station, stops) => {
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
			formattedTrack = "N/A";
		}

		const origin = stops.find((stop) => stop.type === "departure");
		const arrival = stops.find((stop) => stop.type === "arrival");

		if (
			(station.arrived || origin.actual_departure_time) &&
			(station.departed || arrival.actual_arrival_time)
		) {
			formattedTrack = <span className="text-gray-500">{track}</span>;
		} else if (station.arrived && !station.departed) {
			formattedTrack = <span className="animate-pulse">{track}</span>;
		}

		return formattedTrack;
	};

	return (
		<div className="p-4 bg-gray-100 border rounded">
			<button type="button" onClick={onClose} className="mb-4 text-red-500">
				Close
			</button>
			<h3 className="text-xl font-bold mb-2">Treno {trainNumber}</h3>
			<p>
				{trainInfo.origin} · {formatIsoTime(trainInfo.departure_time)}
			</p>
			<p>
				{trainInfo.destination} · {formatIsoTime(trainInfo.arrival_time)}
			</p>
			<p>Ritardo: {formatDelay(trainInfo)}</p>
			<div className="overflow-y-auto max-h-64 mt-4">
				<table className="min-w-full bg-white border">
					<thead>
						<tr>
							<th className="py-2 px-4 border">Stazione</th>
							<th className="py-2 px-4 border">Arrivo programmato</th>
							<th className="py-2 px-4 border">Arrivo effettivo</th>
							<th className="py-2 px-4 border">Partenza programmata</th>
							<th className="py-2 px-4 border">Partenza effettiva</th>
							<th className="py-2 px-4 border">Binario programmato</th>
							<th className="py-2 px-4 border">Binario effettivo</th>
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
								{stop.type === "cancelled" ? (
									<td className="py-2 px-4 border" colSpan="6">
										Cancellato
									</td>
								) : (
									<>
										{index !== 0 && (
											<>
												<td className="py-2 px-4 border">
													{formatIsoTime(stop.scheduled_arrival_time)}
												</td>
												<td className="py-2 px-4 border">
													{stop.actual_arrival_time
														? getFormattedTime(stop, { checkDepartures: false })
														: "N/A"}
												</td>
											</>
										)}
										{index === 0 && (
											<td className="py-2 px-4 border" colSpan="2">
												Stazione di partenza
											</td>
										)}
										{index !== trainInfo.stops.length - 1 && (
											<>
												<td className="py-2 px-4 border">
													{formatIsoTime(stop.scheduled_departure_time)}
												</td>
												<td className="py-2 px-4 border">
													{stop.actual_departure_time
														? getFormattedTime(stop, { checkDepartures: true })
														: "N/A"}
												</td>
											</>
										)}
										{index === trainInfo.stops.length - 1 && (
											<td className="py-2 px-4 border" colSpan="2">
												Stazione di arrivo
											</td>
										)}
										<td className="py-2 px-4 border">
											{stop.scheduled_departure_track || "N/A"}
										</td>
										<td className="py-2 px-4 border">
											{formatTrack(stop, trainInfo.stops)}
										</td>
									</>
								)}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		</div>
	);
}

export default TrainInfo;
