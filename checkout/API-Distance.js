const WastecodeInput = document.getElementById('WasteCode');
WastecodeInput.addEventListener('change', function() {
  //console.log(`wastecode: ${WastecodeInput.value}`);
  const wasteCode = this.value.trim(); 
  if (wasteCode !== '') {
    const formData = new FormData();
    formData.append('WasteCode', wasteCode);

    fetch('../fetch-coordinate.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            console.error('Error fetching coordinates:', data.error);
        } else {
            const coordinates = data.coordinates;

            if (coordinates.length > 0) {
                // Initialize or update the map using the new coordinates
                Des2(data);
            } else {
                console.log('No coordinates found for the selected WasteCode.');
            }
        }
    })
    .catch(error => {
        console.error('Error during fetch:', error);
    });
} else {
      console.log('WasteCode is empty, fetch not triggered.');
  }
});


let map;
let markers = [];
let savedCoordinates = [];

function initMap() {
  const initialLocation = { lat: 13.736717, lng: 100.523186 };
  map = new google.maps.Map(document.getElementById('map'), {
    center: initialLocation,
    zoom: 10
  });
  const input = document.getElementById("pac-input");
  const searchBox = new google.maps.places.SearchBox(input);

  map.addListener("bounds_changed", function() {
    searchBox.setBounds(map.getBounds());
  });

  searchBox.addListener("places_changed", function() {
    const places = searchBox.getPlaces();
    if (places.length == 0) return;

    // ลบ Marker เก่า
    clearMarkers();
    const bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry || !place.geometry.location) {
        console.log("สถานที่ไม่สามารถแสดงพิกัดได้");
        return;
      }

      // เพิ่มพิกัดที่ค้นหาไปยัง savedCoordinates
      savedCoordinates = [place.geometry.location];

      // สร้าง Marker สำหรับตำแหน่งที่ค้นหา
      const marker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        title: place.name
      });
      markers.push(marker);

      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }

      calculateDistances(); // คำนวณระยะทางเมื่อค้นหาสถานที่
    });
    map.fitBounds(bounds);
  }); 
  // เพิ่มการคลิกบนแผนที่เพื่อปักหมุด
  map.addListener('click', function(event) {
    addMarker(event.latLng); // เรียกใช้ฟังก์ชันปักหมุด
  });
}
// ฟังก์ชันปักหมุดหรือเอาหมุดออก
function toggleMarker(location) {
  const existingMarker = markers.find(marker => {
    return marker.getPosition().equals(location);
  });

  if (existingMarker) {
    // ถ้ามีหมุดที่ตำแหน่งนี้อยู่แล้ว เอาหมุดออก
    existingMarker.setMap(null);
    markers = markers.filter(marker => marker !== existingMarker);
    savedCoordinates = savedCoordinates.filter(coord => coord !== location);
  } else {
    // ถ้าไม่มีหมุด สร้างหมุดใหม่
    addMarker(location);
  }

  calculateDistances(); // คำนวณระยะทางหลังจากการสลับหมุด
}
// ฟังก์ชันปักหมุดบนแผนที่
function addMarker(location) {
  // ลบ Marker เก่า
  markers.forEach(marker => marker.setMap(null));
  markers = [];

  // สร้าง Marker ใหม่ที่ตำแหน่งที่คลิก
  const marker = new google.maps.Marker({
    position: location,
    map: map
  });
  markers.push(marker);

  // เพิ่มพิกัดที่คลิกลงใน savedCoordinates
  savedCoordinates.push(location);

  // คำนวณระยะทางระหว่างตำแหน่งต้นทางและตำแหน่งที่คลิก
  calculateDistances();
}
// ฟังก์ชันลบ marker ทั้งหมด
function clearMarkers() {
  markers.forEach(marker => marker.setMap(null));
  markers = [];
}
let desCoordinates = [];
let destination2Array = [];
let supplierCodesArray = [];
let closestSupplierCode = null;
function Des2(data){
  const supplierCodes = data.supplier_codes;
  const coordinates = data.coordinates;
  desCoordinates = coordinates;
  destination2Array = coordinates.map(coord => ({
    lat: parseFloat(coord.latitude),
    lng: parseFloat(coord.longitude),
  }));
  supplierCodesArray = supplierCodes;
  calculateDistances();
}
// ฟังก์ชันคำนวณระยะทาง
function calculateDistances() {
  const origin = { lat: 13.5619, lng: 100.653328 }; // Starting point (Origin)
  const destination = savedCoordinates[savedCoordinates.length - 1]; // Last saved destination
  
  let shortestTotalDistance = null;
  let closestDestination = null;
  closestSupplierCode = null;

  const service = new google.maps.DistanceMatrixService();

  // Validate destination
  if (!destination || typeof destination.lat !== 'function' || typeof destination.lng !== 'function') {
    console.error('Invalid destination coordinates in savedCoordinates.');
    return;
  }

  console.log("Destination Coordinates: ", destination.lat(), destination.lng());

  // Use promises to handle asynchronous distance calculations
  const distancePromises = destination2Array.map((destination2, index) => {
    let totalDistance = 0;

    // First leg: Origin -> Destination
    return new Promise((resolve, reject) => {
      service.getDistanceMatrix(
        {
          origins: [origin],
          destinations: [destination],
          travelMode: google.maps.TravelMode.DRIVING,
          unitSystem: google.maps.UnitSystem.METRIC,
        },
        function (response, status) {
          if (status !== 'OK') {
            reject('Error calculating distance from origin to destination: ' + status);
          } else {
            const result1 = response.rows[0].elements[0];
            if (result1.status === 'OK') {
              const distance1 = result1.distance.value; // Get distance in meters
              totalDistance += distance1;

              // Second leg: Destination -> Destination2
              service.getDistanceMatrix(
                {
                  origins: [destination],
                  destinations: [destination2],
                  travelMode: google.maps.TravelMode.DRIVING,
                  unitSystem: google.maps.UnitSystem.METRIC,
                },
                function (response, status) {
                  if (status !== 'OK') {
                    reject('Error calculating distance from destination to destination2: ' + status);
                  } else {
                    const result2 = response.rows[0].elements[0];
                    if (result2.status === 'OK') {
                      const distance2 = result2.distance.value; // Get distance in meters
                      totalDistance += distance2;

                      // Third leg: Destination2 -> Origin
                      service.getDistanceMatrix(
                        {
                          origins: [destination2],
                          destinations: [origin],
                          travelMode: google.maps.TravelMode.DRIVING,
                          unitSystem: google.maps.UnitSystem.METRIC,
                        },
                        function (response, status) {
                          if (status !== 'OK') {
                            reject('Error calculating distance from destination2 back to origin: ' + status);
                          } else {
                            const result3 = response.rows[0].elements[0];
                            if (result3.status === 'OK') {
                              const distance3 = result3.distance.value; // Get distance in meters
                              totalDistance += distance3;

                              const totalDistanceKm = (totalDistance / 1000).toFixed(2);
                              console.log(`Total Distance for Route ${index + 1}: ${totalDistanceKm} km`);

                              resolve({ totalDistance, index });
                            }
                          }
                        }
                      );
                    }
                  }
                }
              );
            }
          }
        }
      );
    });
  });

  // Process all distance calculations
  Promise.all(distancePromises)
    .then(results => {
      results.forEach(({ totalDistance, index }) => {
        if (shortestTotalDistance === null || totalDistance < shortestTotalDistance) {
          shortestTotalDistance = totalDistance;
          closestDestination = destination2Array[index];
          closestSupplierCode = supplierCodesArray[index]; // Update the supplier code for the shortest route
        }
      });

      // Output the shortest route
      const totalDistanceKm = (shortestTotalDistance / 1000).toFixed(2);
      console.log(`Shortest Route is via Destination2 with coordinates (${closestDestination.lat}, ${closestDestination.lng})`);
      console.log(`Shortest Total Distance: ${totalDistanceKm} km`);
      document.getElementById('distance3').value = `${totalDistanceKm} km`;
      console.log(`Shortest Supplier Code: ${closestSupplierCode}`);
      document.getElementById('lat').value = closestDestination.lat;
      document.getElementById('lng').value = closestDestination.lng;
    })
    .catch(error => {
      console.error(error);
    });
}

// Function to fetch latitude and longitude from the server

      // โหลด Google Maps API พร้อมฟังก์ชัน callback
      function loadGoogleMapsScript() {
        const script = document.createElement("script");
        script.src = "https://maps.googleapis.com/maps/api/js?key=AIzaSyBEb-3ICrtUlo5JtHx0craCNS4yHCkJ95M&libraries=places&callback=initMap";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      loadGoogleMapsScript();
   