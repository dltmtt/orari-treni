import React from "react";
import { formatDelay } from "../utils/utils";
import Departures from "./Departures";
import StationSchedule from "./StationSchedule";

function Arrivals({ stationId, stationName }) {
	return (
		<StationSchedule
			stationId={stationId}
			stationName={stationName}
			apiEndpoint="arrivals"
			toggleViewComponent={Departures}
		/>
	);
}

export default Arrivals;
