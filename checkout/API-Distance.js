function extractLatLongFromURL(url) {
  const regex = /@([0-9.]+),([0-9.]+),/;
  const match = url.match(regex);
  if (match) {
      const lat = parseFloat(match[1]);
      const long = parseFloat(match[2]);
      return { lat, long };
  } else {
      alert("ไม่พบพิกัดในลิงค์ Google Maps ที่ให้มา");
      return null;
  }
}

function calculateDistance() {
  const startLat = 13.5619399;
  const startLong = 100.6534905;

  const url = document.getElementById('googleMapUrl').value;
  const endCoordinates = extractLatLongFromURL(url);

  if (endCoordinates) {
    const endLat = endCoordinates.lat;
    const endLong = endCoordinates.long;

    // ใช้ Google Maps Distance Matrix API
    const origin = new google.maps.LatLng(startLat, startLong);
    const destination = new google.maps.LatLng(endLat, endLong);

    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [origin],
        destinations: [destination],
        travelMode: 'DRIVING',
      },
      function(response, status) {
        if (status === 'OK') {
          const distance = response.rows[0].elements[0].distance.text;
          document.getElementById('distanceResult').innerText = `ระยะทาง: ${distance}`;
        } else {
          document.getElementById('distanceResult').innerText = 'ไม่สามารถคำนวณระยะทางได้';
        }
      }
    );
  }
}