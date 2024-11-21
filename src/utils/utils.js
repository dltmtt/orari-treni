export const formatIsoTime = (iso8601string) => {
	const date = new Date(iso8601string);
	return date.toLocaleTimeString([], {
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	});
};

export const getFormattedTime = (stop, { checkDepartures }) => {
	const actualTime = checkDepartures
		? new Date(stop.actual_departure_time)
		: new Date(stop.actual_arrival_time);
	const scheduledTime = checkDepartures
		? new Date(stop.scheduled_departure_time)
		: new Date(stop.scheduled_arrival_time);

	let formattedTime;

	if (actualTime) {
		if (actualTime > new Date(scheduledTime.getTime() + 30000)) {
			formattedTime = (
				<span className="text-red-500">{formatIsoTime(actualTime)}</span>
			);
		} else {
			formattedTime = (
				<span className="text-green-500">{formatIsoTime(actualTime)}</span>
			);
		}
	} else if (stop.delay > 0) {
		const delayedTime = new Date(scheduledTime.getTime() + stop.delay * 60000);
		formattedTime = (
			<span className="text-yellow-500">{formatIsoTime(delayedTime)}</span>
		);
	} else {
		formattedTime = formatIsoTime(scheduledTime);
	}

	return formattedTime;
};

export const formatDelay = (stop) => {
	if (!stop.stops) {
		return "Non sono disponibili informazioni in tempo reale";
	}

	const origin = stop.stops.find((stop) => stop.type === "departure");

	if (origin.departed) {
		if (stop.delay > 0) {
			return <span className="text-red-500">+{stop.delay}</span>;
		}

		if (stop.delay < 0) {
			return <span className="text-green-500">{stop.delay}</span>;
		}

		return <span>In orario</span>;
	}

	if (origin.actual_departure_track) {
		return <span>Pronto</span>;
	}

	return <span>Non partito</span>;
};
