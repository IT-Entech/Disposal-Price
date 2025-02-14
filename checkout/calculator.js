function clearAndFetch() {
  // ตรวจสอบว่ามีค่าใน input หรือไม่
  const weightInput = document.getElementById('Weight-price');
  
  if (weightInput.value !== '') {
    // ถ้ามีค่าใน input ลบค่าออก
    weightInput.value = '';
  }
  
  // เรียกใช้ฟังก์ชัน fetchData() ที่คุณต้องการ
  fetchData();
}
let Disposalprice = 0; // Global variable for Disposal price
  let consumptionRate = 0; // Global variable for consumption rate
function fetchData() {
  const lat = document.getElementById('lat').value;
  const lng = document.getElementById('lng').value;
  const wasteCode = document.getElementById('WasteCode').value;

  // Prepare the POST request
  const formData = new FormData();
  formData.append('lat', lat);
  formData.append('lng', lng);
  formData.append('WasteCode', wasteCode);

  fetch('../fetch-price.php', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    if (data.disposal_prices && data.disposal_prices.length > 0) {
      const disposalPrice = data.disposal_prices[0].disposal_price;
      document.getElementById('disposal_price').value = isNaN(disposalPrice) ? 'Invalid price' : disposalPrice;
    }  else {
      document.getElementById('disposal_price').value = 'No price found';
    }
  })
  .catch(error => {
    console.error('Error during fetch:', error);
  });
};

// Initial config object with default WasteDisposal
const config = {
  WasteDisposal: 8000,  // Default value until fetched
  Fuel: 35,  // Fuel Rate
  Riskvalue: 1.05,
  IncomeRate: 2.5,
};

const weightInput = document.getElementById('Weight-price');
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
const wastenameInput = document.getElementById('Wastename');
const productPriceElement = document.getElementById('product-price');
const totalBeforeVatElement = document.getElementById('total-before-vat');
const productnameElement = document.getElementById('productname');
const calculateButton = document.getElementById('calculateButton');
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

// Function to calculate and display the price
function calculatePrice() {

  const wastename = document.getElementById('Wastename').value.trim();
  const price = document.getElementById('disposal_price')
  const weightValue = document.getElementById('Weight-price').value.trim();
  const disposal = parseFloat(price.value || price.innerText); 
  if (weightValue !== '' && !isNaN(weightValue)) {
    const weightNumber = parseFloat(weightValue);
    Disposalprice = (disposal * weightNumber); // Update global Disposalprice
    Disposalprice = roundPrice(Disposalprice); // Round the price
    console.log(`Disposal Price: ${Disposalprice}`);
  }
}

function updateConsumptionRate() {
  const distanceInput = document.getElementById('distance3');
  const distance = parseFloat(distanceInput.value || distanceInput.innerText); 

  // ตรวจสอบว่าค่าที่ดึงมาเป็นตัวเลขที่ถูกต้อง
  if (isNaN(distance) || distance <= 0) {
    console.log('ระยะทางไม่ถูกต้อง');
    return;
  }
  calculatePrice();

  let consumptionRate = 0;
  let allowances = {}; // Initialize allowances as an empty object
  let fixcost = {};
  if (isNaN(distance) || distance <= 0) {
    consumptionRate = 0; // Reset if distance is invalid
    return;
  }

  // Truck configuration (can be reused across truck types)
  const truckConfig = {
    truckSmall: { fuelRate: 35, divisor: 10, fixcost: { smalltrans: 2500, Tech: 800, TechAssist: 550 }, 
    allowances: calculateAllowances(distance, [200, 500, 700, 1200, 1700, 2200], { 
    TechAllowance: [200, 200, 200, 850, 950, 1050, 1150], 
    AssistTechAllowance: [150, 150, 150, 750, 800, 900, 1000] }) },

    single_rolloff: { fuelRate: 35, divisor: 2.7, fixcost: { bigtrans: 4200, Driver: 600, Assist: 550 }, 
    allowances: calculateAllowances(distance, [200, 500, 700, 1200, 1700, 2200], { 
    Allowance: [300, 350, 400, 1100, 1200, 1400, 1700], 
    AssistAllowance: [200, 200, 200, 750, 850, 950, 1050] }) },

    trailer_rolloff: { fuelRate: 35, divisor: 2.7, fixcost: { bigtrans: 4200, Driver: 600, Assist: 550 }, 
    allowances: calculateAllowances(distance, [200, 500, 700, 1200, 1700, 2200], { 
    Allowance: [450, 500, 550, 1500, 1650, 1950, 2450], 
    AssistAllowance: [200, 200, 200, 750, 850, 950, 1050] }) },

    single_vacuum: { fuelRate: 35, divisor: 2.6, fixcost: { bigtrans: 4200, Driver: 600, Assist: 550 }, 
    allowances: calculateAllowances(distance, [200, 500, 700, 1200, 1700, 2200], { 
    Allowance: [400, 450, 500, 1300, 1400, 1600, 1900], 
    AssistAllowance: [250, 250, 250, 850, 950, 1050, 1150] }) },

    trailer_vacuum: { fuelRate: 35, divisor: 2.6, fixcost: { bigtrans: 4200, Driver: 600, Assist: 550 }, 
    allowances: calculateAllowances(distance, [200, 500, 700, 1200, 1700, 2200], { 
    Allowance: [600, 650, 700, 1800, 1950, 2250, 2750], 
    AssistAllowance: [250, 250, 250, 850, 950, 1050, 1150] }) },

    single_crane: { fuelRate: 35, divisor: 2.6, fixcost: { bigtrans: 4200, Driver: 600, Assist: 550 }, 
    allowances: calculateAllowances(distance, [200, 500, 700, 1200, 1700, 2200], { 
    Allowance: [450, 500, 550, 1400, 1500, 1700, 2000], 
    AssistAllowance: [300, 300, 300, 950, 1050, 1150, 1250] }) },

    trailer_crane: { fuelRate: 35, divisor: 2.6, fixcost: { bigtrans: 4200, Driver: 600, Assist: 550 }, 
    allowances: calculateAllowances(distance, [200, 500, 700, 1200, 1700, 2200], { 
    Allowance: [650, 700, 750, 1900, 2050, 2350, 2850], 
    AssistAllowance: [300, 300, 300, 950, 1050, 1150, 1250] }) },
  };
  let selectedTruck = '';

   // Update consumption rate based on the selected truck
   if (truckSmallRadio.checked) {
    selectedTruck = 'truckSmall';
  } else if (single_rolloffRadio.checked) {
    selectedTruck = 'single_rolloff';
  }else if (trailer_rolloffRadio.checked) {
    selectedTruck = 'trailer_rolloff';
  }else if (single_vacuumRadio.checked) {
    selectedTruck = 'single_vacuum';
  }else if (trailer_vacuumRadio.checked) {
    selectedTruck = 'trailer_vacuum';
  }else if (single_craneRadio.checked) {
    selectedTruck = 'single_crane';
  }else if (trailer_craneRadio.checked) {
    selectedTruck = 'trailer_crane';
  }

  if (selectedTruck) {
    const { fuelRate, divisor, fixcost: selectedFixcost, allowances: selectedAllowances } = truckConfig[selectedTruck];
    fixcost = selectedFixcost;
    consumptionRate = (distance / divisor) * fuelRate;
    allowances = selectedAllowances;
  }

   
  consumptionRate = Math.round(consumptionRate);
  const fixcostTotal = Object.values(fixcost).reduce((acc, value) => acc + value, 0);
  const allowanceTotal = Object.values(allowances).reduce((acc, value) => acc + value, 0);
  const allowanceValue = fixcostTotal + consumptionRate + allowanceTotal;

  console.log(`FixcostTotal: ${fixcostTotal}`);
  console.log(`Consumption Rate: ${consumptionRate}`);
  console.log(`Allowance Total: ${allowanceTotal}`);
  console.log(`Total Allowance Value: ${allowanceValue}`);
  
  return { allowances, totalAllowanceValue: allowanceValue };
}

// Helper function to calculate allowances based on distance ranges
function calculateAllowances(distance, thresholds, allowanceValues) {
  const allowances = {};
  const keys = Object.keys(allowanceValues);
  
  for (let i = 0; i < thresholds.length; i++) {
    if (distance <= thresholds[i]) {
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



// Function to round the price to the nearest 100
function roundPrice(price) {
  const remainder100 = price % 100;
  return remainder100 > 50 ? price + (100 - remainder100) : price - remainder100;
}
document.getElementById('calculateButton').addEventListener('click', calculateTotal);
function calculateTotal() {

  const { totalAllowanceValue } = updateConsumptionRate();
  const totalPrice = Disposalprice + totalAllowanceValue;
  console.log(`Disposal Price: ${Disposalprice}`);
  console.log(`Consumption Rate: ${totalPrice}`);
  
  if (Disposalprice !== '' && !isNaN(Disposalprice) && totalAllowanceValue !== '' && !isNaN(totalAllowanceValue)) { 

    // Calculate total price
    let priceNumber1 = ((Disposalprice + totalAllowanceValue) * config.Riskvalue) * config.IncomeRate;

    // Round the price
    priceNumber1 = roundPrice(priceNumber1);
    console.log(`Total Price: ${priceNumber1}`);


    
  }
}

document.getElementById('calculateButton').addEventListener('click', function() {
  const modalTitle = document.getElementById('staticBackdropLiveLabel');
  const modalBody = document.getElementById('modalBodyContent');
  const modalFooter = document.getElementById('modalFooterContent');
// Get the weight input value
const weightInput = document.getElementById('Weight-price');
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
  modalBody.innerHTML = `<p>ไม่สามารถคำนวณได้ เนื่องจากใช้เวลานานเกินไป</p>`;
  modalFooter.style.display = 'none'; // Hide footer if needed
}, 5000); // 5000ms or 5 seconds

// Start the calculation
setTimeout(() => {
  // Calculate the total price
  const { totalAllowanceValue } = updateConsumptionRate(); // Ensure this function exists and returns the allowance
  const totalPrice = ((Disposalprice + totalAllowanceValue) * config.Riskvalue) * config.IncomeRate;
  let totalPrice1 = 0;
  totalPrice1 = roundPrice(totalPrice);

  // Clear the timeout because the calculation completed in time
  clearTimeout(calculationTimeout);

  // Update modal content to show the result
  modalTitle.innerText = 'Calculation Complete';
  modalBody.innerHTML = `
    <p>Waste ที่ต้องการกำจัด : ${wastename}</p>
    <p>น้ำหนัก: ${weight.toLocaleString()} ตัน</p>
    <p>ราคาค่าบริการ: ${totalPrice1.toLocaleString()} บาท</p>`;
  modalFooter.style.display = 'block'; // Show the footer
}, 2000); // Simulate a 2-second calculation delay

});





/*********************************************************************************************************************/
// Function to enable or disable vehicle options based on weight input
function toggleVehicleOptions() {
  const weight = parseFloat(weightInput.value);
  
  if (!isNaN(weight) && weight > 0) {
    // Enable radios when a valid weight is entered
    truckSmallRadio.disabled = false;
    truckLargeRadio.disabled = false;

    // Disable small truck if weight exceeds 2 tons
    if (weight > 2) {
      truckSmallRadio.disabled = true;
      truckSmallRadio.checked = false;
      truckOptionsDiv.style.display = 'none'; // Hide truck options if weight > 2 tons
    }
  } else {
    // Disable radios if no valid weight is entered
    truckSmallRadio.disabled = true;
    truckLargeRadio.disabled = true;
  }
}

// Function to reset trailer truck options
function resetTrailerOptions() {
  trailerTruckRadio.checked = false;
  trailer_rolloffRadio.checked = false;
  trailer_vacuumRadio.checked = false;
  trailer_craneRadio.checked = false;
}

// Function to reset single truck options
function resetSingleOptions() {
  singleTruckRadio.checked = false;
  single_rolloffRadio.checked = false;
  single_vacuumRadio.checked = false;
  single_craneRadio.checked = false;
}

// Event listeners for radio buttons to reset options
truckSmallRadio.addEventListener('change', function() {
    resetSingleOptions();
    resetTrailerOptions();
    singleTruckOptionsDiv.style.display = 'none';
    trailerTruckOptionsDiv.style.display = 'none';
  });
  
single_rolloffRadio.addEventListener('change', resetTrailerOptions);
single_vacuumRadio.addEventListener('change', resetTrailerOptions);
single_craneRadio.addEventListener('change', resetTrailerOptions);

trailer_rolloffRadio.addEventListener('change', resetSingleOptions);
trailer_vacuumRadio.addEventListener('change', resetSingleOptions);
trailer_craneRadio.addEventListener('change', resetSingleOptions);

// Show or hide options based on truck type selection
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

// Show or hide truck options based on truck size
truckSmallRadio.addEventListener('change', function() {
  if (truckSmallRadio.checked) {
    truckOptionsDiv.style.display = 'none';
  }
});

truckLargeRadio.addEventListener('change', function() {
  if (truckLargeRadio.checked) {
    truckOptionsDiv.style.display = 'block';
  }
});

// Update truck options visibility based on weight input
weightInput.addEventListener('input', function() {
  weightInput.value = weightInput.value.replace(/[^0-9.]/g, ''); // Allow only numbers and periods
  toggleVehicleOptions(); // Update options based on weight

  if (!truckLargeRadio.checked) {
    truckOptionsDiv.style.display = 'none';
  }
});
// Event listeners for radio buttons to update consumption rate
truckSmallRadio.addEventListener('change', updateConsumptionRate);
single_rolloffRadio.addEventListener('change', updateConsumptionRate);
trailer_rolloffRadio.addEventListener('change', updateConsumptionRate);
single_vacuumRadio.addEventListener('change', updateConsumptionRate);
trailer_vacuumRadio.addEventListener('change', updateConsumptionRate);
single_craneRadio.addEventListener('change', updateConsumptionRate);
trailer_craneRadio.addEventListener('change', updateConsumptionRate);
weightInput.addEventListener('input', calculatePrice);
wastenameInput.addEventListener('input', calculatePrice);

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

