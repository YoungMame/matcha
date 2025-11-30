export async function getCityAndCountryFromCoords(latitude: number, longitude: number): Promise<{ city: string, country: string }> {
    const response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`);
    if (response.status == 429)
    {
        if (process.env.NODE_ENV === 'test')
            return { city: 'Test City', country: 'Test Country' };
        return console.log('Google Maps API rate limit reached'), { city: '...', country: '...' };
    }
    const responseList = await response.json();
    if (!responseList.results || responseList.results.length === 0) {
        return { city: '...', country: '...' };
    }
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