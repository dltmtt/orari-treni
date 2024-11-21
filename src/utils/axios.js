import axios from "axios";

const instance = axios.create({
	baseURL:
		process.env.NODE_ENV === "production"
			? "https://viaggiatreno-api-wrapper.vercel.app"
			: "http://localhost:8000",
});

export default instance;
