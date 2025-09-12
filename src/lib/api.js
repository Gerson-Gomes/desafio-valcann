export  async function getFrontPhotos(api_key) {
  const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/curiosity/photos?sol=1000&api_key=${api_key}&page=1`;
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.photos; 
  } catch (error) {
    console.error('Error fetching Mars photos:', error);
    return [];
  }
}


export async function getRoverCamerasClient(roverName, cameraName, earthDate) {
  const params = new URLSearchParams();
  params.set("rover", roverName);
  if (cameraName) {
    params.set("camera", cameraName)
    
  };
  if (earthDate) params.set("earth_date", earthDate);

  const resp = await fetch(`/api/mars-photos?${params.toString()}`);
  if (!resp.ok) {
    const txt = await resp.text();
    throw new Error(`API error: ${resp.status} ${txt}`);
  }
  const json = await resp.json();
  return json.photos ?? [];
}


export async function getRoverCameras(
  roverName,
  api_key,
  cameraName = undefined,
  earthDate = undefined,
  page = 1
) {
  if (!roverName) throw new Error("Rover name is required");
  if (!api_key) throw new Error("API key is required");

  const params = new URLSearchParams({ api_key });

  if (cameraName) params.append("camera", cameraName);
  if (earthDate) params.append("earth_date", earthDate);
  if (page) params.append("page", String(page));

  const url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${encodeURIComponent(
    roverName
  )}/photos?${params.toString()}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return Array.isArray(data.photos) ? data.photos : [];
  } catch (error) {
    console.error("Error fetching Mars photos by camera:", error);
    return [];
  }
}

export async function getPhotos(apiKey, rover = "curiosity", date = null) {
  let url = `https://api.nasa.gov/mars-photos/api/v1/rovers/${rover.toLowerCase()}/photos?api_key=${apiKey}&earth_date=${date}`;

  if (date) {
    url += `&earth_date=${date}`; // <-- busca por data
  } else {
    url += `&sol=1000`; // fallback
  }

  const res = await fetch(url);
  const data = await res.json();
  return data.photos ?? [];
}

const apiKey = process.env.NEXT_PUBLIC_NASA_API_KEY
getFrontPhotos(apiKey).then(photos => {
  
});