
let currentMarker = null;  // Variable to store the current marker
let savedCoordinates = [];  // Array to store saved coordinates

function initMap() {
  const initialLocation = { lat: 13.736717, lng: 100.523186 };
  const map = new google.maps.Map(document.getElementById('map'), {
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

    const bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry || !place.geometry.location) {
        console.log("สถานที่ไม่สามารถแสดงพิกัดได้");
        return;
      }

      // If a marker already exists, remove it
      if (currentMarker) {
        currentMarker.setMap(null);
      }

   

      // Save the coordinates of the selected place
      savedCoordinates.push(place.geometry.location);

      // Create a new marker for the searched place
      currentMarker = new google.maps.Marker({
        map: map,
        position: place.geometry.location,
        title: place.name
      });

      // Adjust the map to fit the bounds of the searched place
      if (place.geometry.viewport) {
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
    calculateDistances(); // Call calculateDistances after updating the coordinates
  });

  // ตั้งค่าการคลิกบนแผนที่
  map.addListener('click', function(event) {
    const clickedLocation = event.latLng;
    
    // If a marker already exists, remove it
    if (currentMarker) {
      currentMarker.setMap(null);
    }



    // Save the clicked coordinates
    savedCoordinates.push(clickedLocation);

    // Create a new marker at the clicked location
    currentMarker = new google.maps.Marker({
      position: clickedLocation,
      map: map
    });

    // Call calculateDistances after saving the clicked location
    calculateDistances();
  });
}
const WeightInput = document.getElementById('Disposal-weight');
const truckSmallRadio = document.getElementById('truck_small');
const truckLargeRadio = document.getElementById('truck_large');
const truckOptionsDiv = document.getElementById('truckOptions');
const singleTruckRadio = document.getElementById('single_truck');
const trailerTruckRadio = document.getElementById('trailer_truck');
const singleTruckOptionsDiv = document.getElementById('singleTruckOptions');
const single_rolloffRadio = document.getElementById('single_rolloff');
const single_vacuumRadio = document.getElementById('single_vacuum');
const single_craneRadio = document.getElementById('single_crane');
const trailerTruckOptionsDiv = document.getElementById('trailerTruckOptions');
const trailer_rolloffRadio = document.getElementById('trailer_rolloff');
const trailer_vacuumRadio = document.getElementById('trailer_vacuum');
const trailer_craneRadio = document.getElementById('trailer_crane');
const labelSmallTruck = document.querySelector('label[for="truck_small"]');
const labelLargeTruck = document.querySelector('label[for="single_rolloff"]');
const labelLargeVacuum = document.querySelector('label[for="single_vacuum"]');
const labelLargeCrane = document.querySelector('label[for="single_crane"]');
const labelLargeTrailer = document.querySelector('label[for="trailer_rolloff"]');
const labelLargeTV = document.querySelector('label[for="trailer_vacuum"]');
const imageSmallTruck = document.getElementById('truckImage');
const imageLargeTruck = document.getElementById('truckImageLarge');
const imageLargeVacuum = document.getElementById('VacuumImageLarge');
const imageLargeCrane = document.getElementById('CraneImageLarge');
const imageLargeTrailer= document.getElementById('ImageTrailer');
const imageLargeTV = document.getElementById('VacuumImageTrailer');

WeightInput.addEventListener('input', function() {
  WeightInput.value = WeightInput.value.replace(/[^0-9.]/g, '');
});

  function calculateDistances() {
    if (savedCoordinates.length < 1) return; // Make sure there is at least one saved location
    
    const origin = { lat: 13.5619, lng: 100.653328 }; // Starting point (Origin)
    const customer = savedCoordinates[savedCoordinates.length - 1]; // Last saved destination
    const WastecodeInput = document.getElementById('WasteCode');

    //console.log(`พิกัดต้นทาง: ${origin.lat}, ${origin.lng}`);
    //console.log(`พิกัดลูกค้า: ${customer.lat()}, ${customer.lng()}`);
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
                const disposal = data.disposal_prices;
                const supplier_code = data.supplier_codes;
                const disposal_code = data.disposal_codes;
                // Combine latitudes and longitudes into coordinate pairs
                const destinations = data.latitudes.map((lat, index) => ({
                  lat: lat,
                  lng: data.longitudes[index]
              }));

                if (destinations.length > 0) {
                 
                  const destination2Array = destinations.map(coord => ({
                    lat: parseFloat(coord.lat), // Ensure lat/lng are parsed as numbers
                    lng: parseFloat(coord.lng),
                  }));
                  const service = new google.maps.DistanceMatrixService();
                  const totalDistances = [];
                  destination2Array.map((destination2, index) => {
                  let totalSUmDistance = 0;
                  service.getDistanceMatrix(
                    {
                      origins: [origin],
                      destinations: [customer],
                      travelMode: google.maps.TravelMode.DRIVING,
                      unitSystem: google.maps.UnitSystem.METRIC,
                    },
                    function (response, status) {
                      if (status !== 'OK') {
                        console.error('Error calculating distance from origin to customer:', status);
                      } else {
                        const result1 = response.rows[0].elements[0];
                    if (result1.status === 'OK') {
                      const distance1 = result1.distance.value; // ระยะทางในหน่วยเมตร
                      totalSUmDistance += distance1;
                      //console.log(`ระยะทางจากต้นทางถึงลูกค้า: ${(distance1 / 1000).toFixed(2)} km`);
                      
                      // Now, calculate distances for destinations
                     
                      service.getDistanceMatrix(
                        {
                          origins: [customer], // From customer to all destinations
                          destinations: [destination2],
                          travelMode: google.maps.TravelMode.DRIVING,
                          unitSystem: google.maps.UnitSystem.METRIC,
                        },
                        function (response, status) {
                          if (status !== 'OK') {
                            console.error('Error calculating distances to destinations:', status2);
                          } else {
                            const result2 = response.rows[0].elements[0];
                              if (result2.status === 'OK') {
                                const distance = result2.distance.value;
                                totalSUmDistance += distance; // เพิ่มระยะทางไปในระยะทางรวม
                                //console.log(`ระยะทางจากลูกค้าไปปลายทาง ${index + 1}: ${(distance / 1000).toFixed(2)} km`);
                              }
 
                            // Calculate the return distance (from the last destination back to origin)
                            service.getDistanceMatrix(
                              {
                                origins: [destination2], // Last destination
                                destinations: [origin],
                                travelMode: google.maps.TravelMode.DRIVING,
                                unitSystem: google.maps.UnitSystem.METRIC,
                              },
                              function (response, status) {
                                if (status !== 'OK') {
                                  console.error('Error calculating return distance:', status3);
                                } else {
                                  const result3 = response.rows[0].elements[0];
                                  if (result3.status === 'OK') {
                                    const distance3 = result3.distance.value; // Get distance in meters
                                    totalSUmDistance += distance3; // เพิ่มระยะทางไปในระยะทางรวม
                                      const totalDistanceKm = (totalSUmDistance / 1000).toFixed(2);
                                      totalDistances.push(totalDistanceKm);
                                      // แสดงระยะทางรวมของลูกค้าไปยังปลายทางแต่ละแห่ง
                                      console.log(`ระยะทางรวมทั้งหมด ${index + 1}: ${totalDistanceKm} km`);
                                        
                                      if (index === destination2Array.length - 1) {
                                        const supplierData = supplier_code.map((supplier, index) => ({
                                          supplierCode: supplier,
                                          disposalCode: disposal_code[index],
                                          disposalPrice: disposal[index],
                                          destinationLatLng: {
                                            lat: destinations[index].lat,
                                            lng: destinations[index].lng,
                                          },
                                          totalDistance: totalDistances[index]
                                         
                                        }));
                                        WeightInput.addEventListener('change', function() {
                                         weight = parseFloat(WeightInput.value) ;
                                         if (isNaN(weight)) {
                                          console.error('Invalid weight input');
                                          return;
                                        }          
                                        let minTotalCost = Infinity;  // กำหนดค่าเริ่มต้นของราคารวมที่ต่ำที่สุดเป็น Infinity
                                        let supplier_Code = null;
                                        let disposal_Code = null;
                                        let Transport_Cost = null;
                                        let disposal_Cost = null;
                                        let minCalculationIndex = -1; // เก็บหมายเลขของการคำนวณที่มีค่า TotalCOST ต่ำที่สุด
                                        // แสดงผลสำหรับตรวจสอบข้อมูล
                                        supplierData.forEach((data, index) => {
                                          const disposalCost = weight * data.disposalPrice;
                                          const disposalCode = data.disposalCode;
                                          const supplierCode = data.supplierCode;
                                          //console.log(`น้ำหนักขยะที่ปลายทาง ${index + 1}: ${disposalCost} Baht`);
                                          //console.log(`ปลายทาง ${index + 1}: รหัสปลายทาง: ${data.supplierCode}, รหัสกำจัด: ${data.disposalCode}, ราคาค่ากำจัด: ${data.disposalPrice}, พิกัดปลายทาง: (${data.destinationLatLng.lat}, ${data.destinationLatLng.lng}), ระยะทางรวม: ${data.totalDistance} km`);
                                          const truckRadios = document.querySelectorAll('input[name="truckType"]');
                                          const totalDistanceKm = data.totalDistance;
                                          truckRadios.forEach((radio) => {
                                          radio.addEventListener('change',  updateTransportCost)
                                        });
                                            function updateTransportCost() {
                                              let consumptionRate = 0;
                                              let allowances = {}; // Initialize allowances as an empty object
                                              let fixcost = {};
                                              if (isNaN(totalDistanceKm) || totalDistanceKm <= 0) {
                                                consumptionRate = 0; // Reset if distance is invalid
                                                return;
                                              }
                                                                               
                                              const truckConfig = {
                                                truckSmall: { fuelRate: 35, divisor: 10, fixcost: { smalltrans: 2500, Tech: 800, TechAssist: 550 }, 
                                                allowances: calculateAllowances(totalDistanceKm, [200, 500, 700, 1200, 1700, 2200], { 
                                                TechAllowance: [200, 200, 200, 850, 950, 1050, 1150], 
                                                AssistTechAllowance: [150, 150, 150, 750, 800, 900, 1000] }) },
                                            
                                                single_rolloff: { fuelRate: 35, divisor: 2.7, fixcost: { bigtrans: 4200, Driver: 600, Assist: 550 }, 
                                                allowances: calculateAllowances(totalDistanceKm, [200, 500, 700, 1200, 1700, 2200], { 
                                                Allowance: [300, 350, 400, 1100, 1200, 1400, 1700], 
                                                AssistAllowance: [200, 200, 200, 750, 850, 950, 1050] }) },
                                            
                                                trailer_rolloff: { fuelRate: 35, divisor: 2.7, fixcost: { bigtrans: 4200, Driver: 600, Assist: 550 }, 
                                                allowances: calculateAllowances(totalDistanceKm, [200, 500, 700, 1200, 1700, 2200], { 
                                                Allowance: [450, 500, 550, 1500, 1650, 1950, 2450], 
                                                AssistAllowance: [200, 200, 200, 750, 850, 950, 1050] }) },
                                            
                                                single_vacuum: { fuelRate: 35, divisor: 2.6, fixcost: { bigtrans: 4200, Driver: 600, Assist: 550 }, 
                                                allowances: calculateAllowances(totalDistanceKm, [200, 500, 700, 1200, 1700, 2200], { 
                                                Allowance: [400, 450, 500, 1300, 1400, 1600, 1900], 
                                                AssistAllowance: [250, 250, 250, 850, 950, 1050, 1150] }) },
                                            
                                                trailer_vacuum: { fuelRate: 35, divisor: 2.6, fixcost: { bigtrans: 4200, Driver: 600, Assist: 550 }, 
                                                allowances: calculateAllowances(totalDistanceKm, [200, 500, 700, 1200, 1700, 2200], { 
                                                Allowance: [600, 650, 700, 1800, 1950, 2250, 2750], 
                                                AssistAllowance: [250, 250, 250, 850, 950, 1050, 1150] }) },
                                            
                                                single_crane: { fuelRate: 35, divisor: 2.6, fixcost: { bigtrans: 4200, Driver: 600, Assist: 550 }, 
                                                allowances: calculateAllowances(totalDistanceKm, [200, 500, 700, 1200, 1700, 2200], { 
                                                Allowance: [450, 500, 550, 1400, 1500, 1700, 2000], 
                                                AssistAllowance: [300, 300, 300, 950, 1050, 1150, 1250] }) },
                                            
                                                trailer_crane: { fuelRate: 35, divisor: 2.6, fixcost: { bigtrans: 4200, Driver: 600, Assist: 550 }, 
                                                allowances: calculateAllowances(totalDistanceKm, [200, 500, 700, 1200, 1700, 2200], { 
                                                Allowance: [650, 700, 750, 1900, 2050, 2350, 2850], 
                                                AssistAllowance: [300, 300, 300, 950, 1050, 1150, 1250] }) },
                                              };
                                                // Update consumption rate based on the selected truck
                                                let selectedTruck = '';
                                            if (truckSmallRadio.checked) selectedTruck = 'truckSmall';
                                            else if (single_rolloffRadio.checked) selectedTruck = 'single_rolloff';
                                            else if (trailer_rolloffRadio.checked) selectedTruck = 'trailer_rolloff';
                                            else if (single_vacuumRadio.checked) selectedTruck = 'single_vacuum';
                                            else if (trailer_vacuumRadio.checked) selectedTruck = 'trailer_vacuum';
                                            else if (single_craneRadio.checked) selectedTruck = 'single_crane';
                                            else if (trailer_craneRadio.checked) selectedTruck = 'trailer_crane';
                                        
                                              if (selectedTruck) {
                                                const { fuelRate, divisor, fixcost: selectedFixcost, allowances: selectedAllowances } = truckConfig[selectedTruck];
                                                fixcost = selectedFixcost;
                                                consumptionRate = (totalDistanceKm * fuelRate) / divisor;
                                                allowances = selectedAllowances;
                                              }

                                              consumptionRate = Math.round(consumptionRate);
                                              const fixcostTotal = Object.values(fixcost).reduce((acc, value) => acc + value, 0);
                                              const allowanceTotal = Object.values(allowances).reduce((acc, value) => acc + value, 0);
                                              const TransportCost = consumptionRate + fixcostTotal + allowanceTotal;
                                              const TotalCOST = TransportCost + disposalCost;
                                                // แสดงผลสำหรับแต่ละการคำนวณ
                                                console.log(`การคำนวณที่ ${index + 1}:`);
                                                console.log(`Supplier Code: ${supplierCode}`);
                                                console.log(`Disposal Code: ${disposalCode}`);
                                                console.log(`ระยะทาง: ${totalDistanceKm}`);
                                                console.log(`ราคาค่าขนส่ง: ${TransportCost}`);
                                                console.log(`Fixcost Total: ${fixcostTotal.toLocaleString()} Baht`);
                                                console.log(`Consumption Rate: ${consumptionRate.toLocaleString()} Baht`);
                                               console.log(`Allowances: ${allowanceTotal.toLocaleString()} Baht`);
                                                console.log(`Disposal Cost: ${disposalCost.toLocaleString()} Baht`);
                                                console.log(`ราคารวมทั้งหมด: ${TotalCOST.toLocaleString()} Baht`);
                                                // ตรวจสอบและอัปเดตค่าราคารวมที่ต่ำที่สุด
                                            if (TotalCOST < minTotalCost) {
                                              minTotalCost = TotalCOST;
                                              supplier_Code = supplierCode;
                                              disposal_Code = disposalCode;
                                              Transport_Cost = TransportCost;
                                              disposal_Cost = disposalCost;
                                              minCalculationIndex = index + 1;
                                            }
                                        }
                                      });
                                      // แสดงผลราคารวมที่ต่ำที่สุด
                                      const calculateButton = document.getElementById('calculateButton');
                                      calculateButton.addEventListener('click', function() {
                                        /*if (minCalculationIndex !== -1) {
                                          console.log(`\nการคำนวณที่มีราคารวมทั้งหมดต่ำที่สุด:`);
                                          console.log(`การคำนวณที่ ${minCalculationIndex}`);
                                          console.log(`Supplier Code: ${supplier_Code}`);
                                          console.log(`Disposal Code: ${disposal_Code}`);
                                          console.log(`ราคาค่าขนส่ง: ${Transport_Cost}`);
                                          console.log(`Disposal Cost: ${disposal_Cost.toLocaleString()} Baht`);
                                          const miniTotalCost = roundPrice(minTotalCost).toLocaleString();
                                          console.log(`ราคารวมทั้งหมดที่ต่ำที่สุด: ${miniTotalCost} Baht`);
                                        }*/
                                        const modalTitle = document.getElementById('staticBackdropLiveLabel');
                                        const modalBody = document.getElementById('modalBodyContent');
                                        const modalFooter = document.getElementById('modalFooterContent');
                                       // Get the weight input value
                                       const weightInput = document.getElementById('Disposal-weight');
                                       const weight = parseFloat(weightInput.value);
                                       const wastenameInput = document.getElementById('Wastename');
                                       const wastename = wastenameInput.value; 
                                       
                                       if (!wastename) {
                                         alert("กรุณากรอกชื่อWaste"); // Alert if waste name is not provided
                                         return; // Prevent further execution if waste name is missing
                                       }
                                        // Check if the required fields are filled out
                                        if (!weight || isNaN(weight)) {
                                         alert("กรุณากรอกน้ำหนัก"); // Alert if weight is not provided
                                         return; // Prevent further execution if weight is missing
                                       }
                                       
                                       
                                         // Show the spinner modal
                                         const spinnerModal = new bootstrap.Modal(document.getElementById('staticBackdropLive'));
                                         spinnerModal.show();
                                       
                                         // Reset modal content to spinner and loading message
                                         modalTitle.innerText = 'Processing...';
                                         modalBody.innerHTML = `
                                           <div class="spinner-border text-primary" role="status">
                                             <span class="visually-hidden">Loading...</span>
                                           </div>
                                           <p>Calculating...</p>`;
                                         modalFooter.style.display = 'none';
                                       
                                         // Simulate a delay for calculation (e.g., 2 seconds)
                                       // Set a timeout to check the calculation time
                                       const calculationTimeout = setTimeout(() => {
                                         // Show an error message if the calculation took too long (more than 5000ms)
                                         modalTitle.innerText = 'Calculation Error';
                                         modalBody.innerHTML = `<p>ไม่สามารถคำนวณได้ กรุณาลองใหม่อีกครั้ง</p>`;
                                         modalFooter.style.display = 'none'; // Hide footer if needed
                                       }, 5000); // 5000ms or 5 seconds
                                       
                                       // Start the calculation
                                       setTimeout(() => {
                                         if (minCalculationIndex !== -1) {
                                           //console.log(`\nการคำนวณที่มีราคารวมทั้งหมดต่ำที่สุด:`);
                                           //console.log(`การคำนวณที่ ${minCalculationIndex}`);
                                           //console.log(`Supplier Code: ${supplier_Code}`);
                                           //console.log(`Disposal Code: ${disposal_Code}`);
                                           //console.log(`ราคาค่าขนส่ง: ${Transport_Cost}`);
                                           //console.log(`Disposal Cost: ${disposal_Cost.toLocaleString()} Baht`);
                                           const miniTotalCost = roundPrice(minTotalCost).toLocaleString();
                                           //console.log(`ราคารวมทั้งหมดที่ต่ำที่สุด: ${miniTotalCost} Baht`);
                                         
                                         // Clear the timeout because the calculation completed in time
                                         clearTimeout(calculationTimeout);
                                       
                                         // Update modal content to show the result
                                         modalTitle.innerText = 'การคำนวณราคาเสร็จสิ้น';
                                         modalBody.innerHTML = `
                                           <p>Waste ที่ต้องการกำจัด : ${wastename}</p>
                                           <p>น้ำหนัก: ${weight.toLocaleString()} ตัน</p>
                                           <p>ราคาค่าบริการ: ${miniTotalCost.toLocaleString()} บาท</p>`;
                                         modalFooter.style.display = 'block'; // Show the footer
                                         }
                                       }, 2000); // Simulate a 2-second calculation delay
                                       
                                       });
                                    });

                                  }
                                }
                              }
                            }
                          );
                        }
                      }
                    );
                  }
                }
              }
            );  
          });
          } else {
            console.log('No coordinates found for the selected WasteCode.');
          }
        }
      });
     
  }
});
  }
  function roundPrice(price) {
    const remainder100 = price % 1000;
    return remainder100 > 100 ? price + (1000 - remainder100) : price - remainder100;
  }
  function calculateAllowances(totalDistanceKm, thresholds, allowanceValues) {
    const allowances = {};
    const keys = Object.keys(allowanceValues);
    
    for (let i = 0; i < thresholds.length; i++) {
      if (totalDistanceKm <= thresholds[i]) {
        keys.forEach(key => {
          allowances[key] = allowanceValues[key][i];
        });
        return allowances; // ออกจากลูปเมื่อเจอระยะที่ตรงเงื่อนไข
      }
    }
  
    // ถ้า distance มากกว่า 2200 ให้ใช้ค่า allowance ที่สุดท้ายใน array
    keys.forEach(key => {
      allowances[key] = allowanceValues[key][allowanceValues[key].length - 1];
    });
  
    return allowances;
  }
      // โหลด Google Maps API พร้อมฟังก์ชัน callback
      function loadGoogleMapsScript() {
        const script = document.createElement("script");
        script.src = "http://localhost:3000/maps";  // เรียก API ผ่าน Proxy Server
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
      
      loadGoogleMapsScript();

      function resetTrailerOptions() {
        trailerTruckRadio.checked = false;
        trailer_rolloffRadio.checked = false;
        trailer_vacuumRadio.checked = false;
        trailer_craneRadio.checked = false;
      }
      function resetvehicleOptions() {
        truckSmallRadio.checked = false;
        truckLargeRadio.checked = false;
      }
      // Function to reset single truck options
      function resetSingleOptions() {
        singleTruckRadio.checked = false;
        single_rolloffRadio.checked = false;
        single_vacuumRadio.checked = false;
        single_craneRadio.checked = false;
      }
      WeightInput.addEventListener('change', function() {
        const weight = parseFloat(WeightInput.value) || 0; // Parsing the weight input
      
        // Check if weight is a valid number greater than 0
        if (!isNaN(weight) && weight > 0) {
          // Enable truck radio buttons
          truckSmallRadio.disabled = false;
          truckLargeRadio.disabled = false;
      
          // Disable small truck and hide options if weight exceeds 2 tons
          if (weight > 2 && weight <= 12) {
            truckSmallRadio.disabled = true;
            truckSmallRadio.checked = false;
            truckOptionsDiv.style.display = 'none'; // Hide truck options for small trucks
          } else if (weight > 12) {
            truckSmallRadio.disabled = true;
            singleTruckRadio.disabled = true;
            truckOptionsDiv.style.display = 'none'; // Disable single truck radio if weight exceeds 12 tons
            singleTruckOptionsDiv.style.display = 'none';
            trailerTruckOptionsDiv.style.display = 'none';
          } else {
            truckOptionsDiv.style.display = 'none'; // Show truck options if weight is <= 2 tons
          }
        } else {
          // Disable truck options if no valid weight is entered
          truckSmallRadio.disabled = true;
          truckLargeRadio.disabled = true;
          truckOptionsDiv.style.display = 'none'; // Ensure truck options are hidden
      

        }
                  // Reset all truck option selections
                  resetSingleOptions();
                  resetTrailerOptions();
                  resetvehicleOptions();
      });
      truckSmallRadio.addEventListener('change', function() {
        if (truckSmallRadio.checked) {
          truckLargeRadio.checked = false;
          truckOptionsDiv.style.display = 'none';
        }
        resetSingleOptions();
        resetTrailerOptions();
        singleTruckOptionsDiv.style.display = 'none';
        trailerTruckOptionsDiv.style.display = 'none';
      });
      truckLargeRadio.addEventListener('change', function() {
        if (truckLargeRadio.checked) {
          truckSmallRadio.checked = false;
          truckOptionsDiv.style.display = 'block';
        }
      });
      singleTruckRadio.addEventListener('change', function() {
        if (singleTruckRadio.checked) {
          singleTruckOptionsDiv.style.display = 'block';
          trailerTruckOptionsDiv.style.display = 'none';
        }
      });
      
      trailerTruckRadio.addEventListener('change', function() {
        if (trailerTruckRadio.checked) {
          singleTruckOptionsDiv.style.display = 'none';
          trailerTruckOptionsDiv.style.display = 'block';
        }
      });
      labelSmallTruck.addEventListener('mouseenter', () => (imageSmallTruck.style.display = 'block'));
labelSmallTruck.addEventListener('mouseleave', () => (imageSmallTruck.style.display = 'none'));
labelLargeTruck.addEventListener('mouseenter', () => (imageLargeTruck.style.display = 'block'));
labelLargeTruck.addEventListener('mouseleave', () => (imageLargeTruck.style.display = 'none'));
labelLargeVacuum.addEventListener('mouseenter', () => (imageLargeVacuum.style.display = 'block'));
labelLargeVacuum.addEventListener('mouseleave', () => (imageLargeVacuum.style.display = 'none'));
labelLargeCrane.addEventListener('mouseenter', () => (imageLargeCrane.style.display = 'block'));
labelLargeCrane.addEventListener('mouseleave', () => (imageLargeCrane.style.display = 'none'));
labelLargeTrailer.addEventListener('mouseenter', () => (imageLargeTrailer.style.display = 'block'));
labelLargeTrailer.addEventListener('mouseleave', () => (imageLargeTrailer.style.display = 'none'));
labelLargeTV.addEventListener('mouseenter', () => (imageLargeTV.style.display = 'block'));
labelLargeTV.addEventListener('mouseleave', () => (imageLargeTV.style.display = 'none'));
