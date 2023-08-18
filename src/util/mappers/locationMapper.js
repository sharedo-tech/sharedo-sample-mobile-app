const fromParticipantLocation = participantLocation => {
  const location = {
      addressLine1: participantLocation.addressLine1,
      addressLine2: participantLocation.addressLine2,
      town: participantLocation.town,
      postCode: participantLocation.postCode,
      country: participantLocation.country
  };

  if (participantLocation.aspectData
      && participantLocation.aspectData.locationMap
      && participantLocation.aspectData.locationMap.addressLocations
      && participantLocation.aspectData.locationMap.addressLocations.length > 0) {

      const { latitude, longitude } = participantLocation.aspectData.locationMap.addressLocations[0];
      [location.latitude, location.longitude] = [latitude, longitude];
  }

  return location;
}

const fromIncident = incident => ({
  addressLine1: incident["incidentDetailsLocation.location.address.line1"],
  addressLine2: incident["incidentDetailsLocation.location.address.line2"],
  town: incident["incidentDetailsLocation.location.address.town"],
  postCode: incident["incidentDetailsLocation.location.address.postcode"],
  country: incident["incidentDetailsLocation.location.address.country.name"],
  latitude: incident["incidentDetailsLocation.location.coords.lat"],
  longitude: incident["incidentDetailsLocation.location.coords.long"],
})

export {
  fromParticipantLocation,
  fromIncident
}