export const formatTime = (dateString) => {
	const date = new Date(dateString);
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

	console.log("stop", stop);

	let formattedTime;

	if (actualTime) {
		if (actualTime > new Date(scheduledTime.getTime() + 30000)) {
			formattedTime = (
				<span className="text-red-500">{formatTime(actualTime)}</span>
			);
		} else {
			formattedTime = (
				<span className="text-green-500">{formatTime(actualTime)}</span>
			);
		}
	} else if (stop.delay > 0) {
		const delayedTime = new Date(scheduledTime.getTime() + stop.delay * 60000);
		formattedTime = (
			<span className="text-yellow-500">{formatTime(delayedTime)}</span>
		);
	} else {
		formattedTime = formatTime(scheduledTime);
	}

	return formattedTime;
};

export const formatDelay = (stop) => {
	const origin = stop.stops[0];

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
