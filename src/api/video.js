export const getAllVideos = async () => {
  const res = await axios.post("http://localhost:7000/api/v1/videos", {
    withCredentials: true,
  });

  return res.data.data;
};
