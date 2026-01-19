export const getAllVideos = async () => {
  const res = await axios.post(
    "https://clipprx-backend.onrender.com/api/v1/videos",
    {},
    {
      withCredentials: true,
    }
  );

  return res.data.data;
};
