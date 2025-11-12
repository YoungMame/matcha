export async function getCityAndCountryFromCoords(latitude: number, longitude: number): Promise<{ city: string, country: string }> {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
    const responseList = await response.json();
    const responseData: {
        address_components: {
            long_name: string,
            short_name: string,
            types: string[]
        }[]
    } = responseList.results[0];
    const city = responseData.address_components.find(c => c.types.includes('locality'));
    const country = responseData.address_components.find(c => c.types.includes('country'));
    return { city: city ? city.long_name : '...', country: country ? country.long_name : '...'  };
}