
let currentMarker = null;  // Variable to store the current marker
let savedCoordinates = [];  // Array to store saved coordinates


function initMap() {
    const initialLocation = {
     lat: 13.736717,
     lng: 100.523186
    };
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
            //console.log("สถานที่ไม่สามารถแสดงพิกัดได้");
            return;
          }
    
          // เพิ่มพิกัดที่ค้นหาไปยัง savedCoordinates
          savedCoordinates = [place.geometry.location];
    
          // สร้าง Marker สำหรับตำแหน่งที่ค้นหา
          currentMarker = new google.maps.Marker({
            map: map,
            position: place.geometry.location,
            title: place.name
          });
    
    
          if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
          } else {
            bounds.extend(place.geometry.location);
          }
    
          SaveLoglastlocation(); // คำนวณระยะทางเมื่อค้นหาสถานที่
        });
        map.fitBounds(bounds);
      }); 
   
    // ตั้งค่าการคลิกบนแผนที่
    map.addListener('click', function(event) {
     const clickedLocation = event.latLng;
   
     // If a marker already exists, remove it
     if (currentMarker) {
      currentMarker.setMap(null);
     }
   
   
   
     // Save the clicked coordinates
     savedCoordinates = [clickedLocation];
   
     // Create a new marker at the clicked location
     currentMarker = new google.maps.Marker({
      position: clickedLocation,
      map: map
     });
   
     // Call calculateDistances after saving the clicked location
     SaveLoglastlocation();
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
const TelInput = document.getElementById('Tel');
TelInput.addEventListener('input', function() {
    TelInput.value = TelInput.value.replace(/[^0-9.]/g, '');
  });

function SaveLoglastlocation () {
    if (savedCoordinates.length === 0) return;
    const lastLocation = savedCoordinates[savedCoordinates.length - 1]; // Only the last coordinate
    //console.log("Calculating distance for:", lastLocation.lat(), lastLocation.lng());
    calculateDistances(lastLocation);
}
function calculateDistances(lastLocation) {
    if (!lastLocation) return;
    const origin = { lat: 13.5619, lng: 100.653328 };
    const WastecodeInput = document.getElementById('WasteCode');
    //console.log("Calculating distance for:", lastLocation.lat(), lastLocation.lng());
    async function calculateDistanceMatrix(service, origins, destinations) {
        return new Promise((resolve, reject) => {
          service.getDistanceMatrix(
            {
              origins: origins,
              destinations: destinations,
              travelMode: google.maps.TravelMode.DRIVING,
              unitSystem: google.maps.UnitSystem.METRIC,
            },
            (response, status) => {
              if (status !== 'OK') {
                reject(`Error calculating distance: ${status}`);
              } else {
                const distance = response.rows[0].elements[0].distance.value; // meters
                resolve(distance);
              }
            }
          );
        });
      }
      WastecodeInput.addEventListener('change', async function () {
    
        const wasteCode = this.value.trim();
        if (wasteCode !== '') {
          const formData = new FormData();
          formData.append('WasteCode', wasteCode);
          try {
            const response = await fetch('../fetch-coordinate.php', {
              method: 'POST',
              body: formData,
            });
            const data = await response.json();
      
            if (data.error) {
              console.error('Error fetching coordinates:', data.error);
              return;
            }
            const disposal = data.disposal_prices;
                const supplier_code = data.supplier_codes;
                const disposal_code = data.disposal_codes;
            const destinations = data.latitudes.map((lat, index) => ({
              lat: parseFloat(lat),
              lng: parseFloat(data.longitudes[index]),
            }));
      
            if (destinations.length > 0) {
              const totalDistances = [];
              const service = new google.maps.DistanceMatrixService();
      
              for (let [index, destination2] of destinations.entries()) {
                let totalSumDistance = 0;
                const destination2Array = destinations.map(coord => ({
                    lat: parseFloat(coord.lat), // Ensure lat/lng are parsed as numbers
                    lng: parseFloat(coord.lng),
                  }));
                try {
                  // Step 1: Origin to Customer
                  const distance1 = await calculateDistanceMatrix(service, [origin], [lastLocation]);
                  totalSumDistance += distance1;
      
                  // Step 2: Customer to Destination
                  const distance2 = await calculateDistanceMatrix(service, [lastLocation], [destination2]);
                  totalSumDistance += distance2;
      
                  // Step 3: Destination to Origin (return trip)
                  const distance3 = await calculateDistanceMatrix(service, [destination2], [origin]);
                  totalSumDistance += distance3;
      
                  const totalDistanceKm = (totalSumDistance / 1000).toFixed(2);
                  totalDistances.push(totalDistanceKm);
                  //console.log(`Total distance for destination ${index + 1}: ${totalDistanceKm} km`);
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
                    let coordinateds = null;
                    let Transport_Cost = null;
                    let TruckType = null;
                    let disposal_Cost = null;
                    let distancekm = null;
                    let consumption = null;
                    let Allowance = null;
                    let fixedcost = null;
                    let minCalculationIndex = -1; // เก็บหมายเลขของการคำนวณที่มีค่า TotalCOST ต่ำที่สุด
                    // แสดงผลสำหรับตรวจสอบข้อมูล
                    supplierData.forEach((data, index) => {
                        const disposalCost = weight * data.disposalPrice;
                        const disposalCode = data.disposalCode;
                        const supplierCode = data.supplierCode;
                        const coordinated = data.destinationLatLng;
                        //console.log(`น้ำหนักขยะที่ปลายทาง ${index + 1}: ${disposalCost} Baht`);
                        //console.log(`ปลายทาง ${index + 1}: รหัสปลายทาง: ${data.supplierCode}, รหัสกำจัด: ${data.disposalCode}, ราคาค่ากำจัด: ${data.disposalPrice}, พิกัดปลายทาง: (${data.destinationLatLng.lat}, ${data.destinationLatLng.lng}), ระยะทางรวม: ${data.totalDistance} km`);
                        const truckRadios = document.querySelectorAll('input[name="truckType"]');
                        const totalDistanceKm = data.totalDistance;
                        truckRadios.forEach((radio) => {
                         radio.addEventListener('change', updateTransportCost)
                        });
                     
                        function updateTransportCost() {
                         let consumptionRate = 0;
                         let allowances = {}; // Initialize allowances as an empty object
                         let fixcost = {};
                         if (isNaN(totalDistanceKm) || totalDistanceKm <= 0) {
                          consumptionRate = 0; // Reset if distance is invalid
                          return;
                         }
                         // ใช้ Fetch API เพื่อดึงข้อมูลจาก PHP
                          fetch('../Get-Api-map.php')
                          .then(response => response.json())
                          .then(data => {
                              const Config = data;     
                              const truckConfig = {
                                truckSmall: {
                                 fuelRate: Config.truckSmall.fuelRate,
                                 divisor: Config.truckSmall.divisor,
                                 maintanance: Config.truckSmall.maintanance,
                                 fixcost: Config.truckSmall.fixcost,
                                 allowances: calculateAllowances(totalDistanceKm, Config.truckSmall.allowances, {
                                  TechAllowance: Config.truckSmall.TechAllowance,
                                  AssistTechAllowance: Config.truckSmall.AssistTechAllowance
                                 })
                                },
                           
                                single_rolloff: {
                                 fuelRate: Config.single_rolloff.fuelRate,
                                 divisor: Config.single_rolloff.divisor,
                                 maintanance: Config.single_rolloff.maintanance,
                                 fixcost: Config.single_rolloff.fixcost,
                                 allowances: calculateAllowances(totalDistanceKm, Config.single_rolloff.allowances, {
                                  Allowance: Config.single_rolloff.Allowance,
                                  AssistAllowance: Config.single_rolloff.AssistAllowance
                                 })
                                },
                           
                                trailer_rolloff: {
                                  fuelRate: Config.trailer_rolloff.fuelRate,
                                  divisor: Config.trailer_rolloff.divisor,
                                  maintanance: Config.trailer_rolloff.maintanance,
                                  fixcost: Config.trailer_rolloff.fixcost,
                                  allowances: calculateAllowances(totalDistanceKm, Config.trailer_rolloff.allowances, {
                                   Allowance: Config.trailer_rolloff.Allowance,
                                   AssistAllowance: Config.trailer_rolloff.AssistAllowance
                                  })
                                 },
                           
                                single_vacuum: {
                                  fuelRate: Config.single_vacuum.fuelRate,
                                  divisor: Config.single_vacuum.divisor,
                                  maintanance: Config.single_vacuum.maintanance,
                                  fixcost: Config.single_vacuum.fixcost,
                                  allowances: calculateAllowances(totalDistanceKm, Config.single_vacuum.allowances, {
                                   Allowance: Config.single_vacuum.Allowance,
                                   AssistAllowance: Config.single_vacuum.AssistAllowance
                                  })
                                 },
                           
                                trailer_vacuum: {
                                  fuelRate: Config.trailer_vacuum.fuelRate,
                                  divisor: Config.trailer_vacuum.divisor,
                                  maintanance: Config.trailer_vacuum.maintanance,
                                  fixcost: Config.trailer_vacuum.fixcost,
                                  allowances: calculateAllowances(totalDistanceKm, Config.trailer_vacuum.allowances, {
                                   Allowance: Config.trailer_vacuum.Allowance,
                                   AssistAllowance: Config.trailer_vacuum.AssistAllowance
                                  })
                                 },
                           
                                single_crane: {
                                  fuelRate: Config.single_crane.fuelRate,
                                  divisor: Config.single_crane.divisor,
                                  maintanance: Config.single_crane.maintanance,
                                  fixcost: Config.single_crane.fixcost,
                                  allowances: calculateAllowances(totalDistanceKm, Config.single_crane.allowances, {
                                   Allowance: Config.single_crane.Allowance,
                                   AssistAllowance: Config.single_crane.AssistAllowance
                                  })
                                 },
                           
                                trailer_crane: {
                                  fuelRate: Config.trailer_crane.fuelRate,
                                  divisor: Config.trailer_crane.divisor,
                                  maintanance: Config.trailer_crane.maintanance,
                                  fixcost: Config.trailer_crane.fixcost,
                                  allowances: calculateAllowances(totalDistanceKm, Config.trailer_crane.allowances, {
                                   Allowance: Config.trailer_crane.Allowance,
                                   AssistAllowance: Config.trailer_crane.AssistAllowance
                                  })
                                 },
                               };
                              // สามารถใช้งาน truckConfig ต่อได้ที่นี่
                       
                        
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
                            const {
                            fuelRate,
                            divisor,
                            maintanance,
                            fixcost: selectedFixcost,
                            allowances: selectedAllowances
                            } = truckConfig[selectedTruck];
                            costMA = maintanance * totalDistanceKm;
                            fixcost = selectedFixcost;
                            consumptionRate = (totalDistanceKm * fuelRate) / divisor;
                            allowances = selectedAllowances;
                          }
                         consumptionRate = Math.round(consumptionRate);
                         const fixcostTotal = Object.values(fixcost).reduce((acc, value) => acc + value, 0);
                         const allowanceTotal = Object.values(allowances).reduce((acc, value) => acc + value, 0);
                         const TransportCost = consumptionRate + fixcostTotal + allowanceTotal;
                         const CostRisk = (TransportCost + disposalCost + 860) * 0.05;
                         const TotalCOST = ((TransportCost + disposalCost + 860) + CostRisk) * 2.5;
                         
                         // ตรวจสอบและอัปเดตค่าราคารวมที่ต่ำที่สุด
                         if (TotalCOST < minTotalCost) {
                          minTotalCost = TotalCOST;
                          supplier_Code = supplierCode;
                          disposal_Code = disposalCode;
                          TruckType = selectedTruck;
                          Transport_Cost = TransportCost;
                          disposal_Cost = disposalCost;
                          distancekm = totalDistanceKm;
                          fixedcost = fixcostTotal;
                          consumption = consumptionRate;
                          Allowance = allowanceTotal;
                          coordinateds = coordinated;
                          minCalculationIndex = index + 1;
                         }
                        })
                        .catch(error => console.error('Error fetching truck data:', error));
                        }
                       });
                  // แสดงผลราคารวมที่ต่ำที่สุด
                  const calculateButton = document.getElementById('calculateButton');
                  calculateButton.addEventListener('click', function() {
                    const modalTitle = document.getElementById('staticBackdropLiveLabel');
                    const modalBody = document.getElementById('modalBodyContent');
                    const modalFooter = document.getElementById('modalFooterContent');
                    console.log('พิกัด:', coordinateds);
                   // Get the weight input value
                   const weightInput = document.getElementById('Disposal-weight');
                   const weight = parseFloat(weightInput.value);
                   const companyNameInput = document.getElementById('companyName');
                   const companyName = companyNameInput.value;
                   const WastecodeInput = document.getElementById('WasteCode');
                   const wastecode = WastecodeInput.value;
                   const wastenameInput = document.getElementById('Wastename');
                   const wastename = wastenameInput.value; 
                   const contactnameInput = document.getElementById('name');
                   const contactname = contactnameInput.value; 
                   const EmailInput = document.getElementById('Email');
                   const Email = EmailInput.value;
                   const TelInput = document.getElementById('Tel');
                   const Tel = TelInput.value;
                   const servicesInput = document.getElementById('services');
                   const services = servicesInput.value;
                   
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
                       const miniTotalCost = roundPrice(minTotalCost);                
                     // Clear the timeout because the calculation completed in time
                     clearTimeout(calculationTimeout);
                   
                     // Update modal content to show the result
                     modalTitle.innerText = 'การคำนวณราคาเสร็จสิ้น';
                     modalBody.innerHTML = `
                       <p>Waste ที่ต้องการกำจัด : ${wastename}</p>
                       <p>น้ำหนัก: ${weight.toLocaleString()} ตัน</p>
                       <p>ราคาค่าบริการ: ${miniTotalCost.toLocaleString()} บาท</p>
                       <div>
                       <label for="serviceInterested">
                         <input type="checkbox" id="serviceInterested">
                         สนใจบริการนี้
                       </label>
                     </div>`;
                     let serviceInterestedValue = 'N'; // Default value is 'N'

                     // Listen for checkbox changes
                     document.getElementById('serviceInterested').addEventListener('change', function () {
                       serviceInterestedValue = this.checked ? 'Y' : 'N';
                     });

                       modalFooter.innerHTML = `<button  id="okButton" class="btn btn-primary">OK</button>`;
                     modalFooter.style.display = 'block'; // Show the footer
                     document.getElementById('okButton').addEventListener('click', () => {
                      const data = {
                        companyName: companyName,
                        coordinates: coordinateds,
                        wastecode: wastecode,
                        wastename: wastename,
                        disposal_Code: disposal_Code,
                        supplier_Code: supplier_Code,
                        Total_before_vat: miniTotalCost,
                        DistanceKM: distancekm,
                        disposal_Cost: disposal_Cost,
                        weight: weight,
                        fixCosts: fixedcost,
                        vehicle_type: TruckType,
                        consumption: consumption,
                        Allowance: Allowance,
                        contactname: contactname,
                        Email: Email,
                        Tel: Tel,
                        services: services,
                        serviceInterested: serviceInterestedValue
                      };
                      const jsonData = JSON.stringify(data);
                      fetch('../insertData.php', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json' // กำหนด header ว่าเป็น JSON
                          },
                          body: jsonData
                      })
                         .then(response => response.text())
                         .then(data => {
                          //console.log('Success:', data);
                          window.location.reload();
                        })
                         .catch(error => {
                          console.error('Error:', error);
                         });
                       });
                     }
                   }, 2000); 
                   
                   });
                });

              }
                } catch (error) {
                  console.error('Error calculating distances:', error);
                }
              }
            }
          } catch (error) {
            console.error('Error fetching waste code data:', error);
          }
        }
      });
  }
  function roundPrice(price) {
    const remainder100 = price % 1000;
    return remainder100 > 500 ? price + (1000 - remainder100) : price - remainder100;
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
