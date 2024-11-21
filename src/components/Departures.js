import React from "react";
import Arrivals from "./Arrivals";
import StationSchedule from "./StationSchedule";

function Departures({ stationId, stationName }) {
	return (
		<StationSchedule
			stationId={stationId}
			stationName={stationName}
			apiEndpoint="departures"
			toggleViewComponent={Arrivals}
		/>
	);
}

export default Departures;
