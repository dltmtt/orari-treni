import axios from "axios";

const instance = axios.create({
	baseURL: "https://viaggiatreno-api-wrapper.vercel.app",
});

export default instance;
