// Constants
//const Distance = 76; // Example distance
const weightNumber = 2; // Example weight

// Fuel rate (unused in current logic, but kept for future use)
const Fuel = 35;

// Small vehicle rates
const smalltrans = 2500;
const Tech = 800;
const TechAssist = 550;

// Large vehicle rates
const bigtrans = 4200;
const Driver = 600;
const Assist = 550;

// Allowances
const allowance = 350;
const Assistallowance = 200;

// Risk value (unused in current logic, but kept for future use)
const Riskvalue = 1.05;

// Initialize allowances with default values
let TechAllowance = 0;
let AssistTechAllowance = 0;

// Calculate allowances based on distance
function calculateAllowances(distance) {
  if (Distance <= 200) {
    return { TechAllowance: 200, AssistTechAllowance: 150, Allowance: 300, AssistAllowance: 200 };  
  } else if (distance >= 201 && distance <= 500) {
    return { TechAllowance: 200, AssistTechAllowance: 150, Allowance: 350, AssistAllowance: 200 };  
  } else if (distance >= 501 && distance <= 700) {
    return { TechAllowance: 200, AssistTechAllowance: 150, Allowance: 400, AssistAllowance: 200 };  
  }else if (distance >= 701 && distance <= 1200) {
    return { TechAllowance: 850, AssistTechAllowance: 700, Allowance: 1100, AssistAllowance: 750 };  
  } else if (distance >= 1201 && distance <= 1700) {
    return { TechAllowance: 950, AssistTechAllowance: 800, Allowance: 1200, AssistAllowance: 850 };  
  }else if (distance >= 1701 && distance <= 2200) {
    return { TechAllowance: 1050, AssistTechAllowance: 900, Allowance: 1400, AssistAllowance: 950 };  
  }else if (distance >= 2201) {
    return { TechAllowance: 1150, AssistTechAllowance: 100, Allowance: 1700, AssistAllowance: 1050 };  
  }
}

// Calculate transport cost based on weight
let transportCost;
if (weightNumber > 10) {
  transportCost = bigtrans + Driver + Assist + allowance + Assistallowance;
} else {
  transportCost = smalltrans + Tech + TechAssist + TechAllowance + AssistTechAllowance;
}
let priceNumber1 = (((weightNumber * 600) + transportCost + (Distance * Fuel)) * Riskvalue) * 2.5;
let priceNumber2 = (((weightNumber * 600) + transportCost + (Distance * Fuel)) * Riskvalue) ;
let priceNumber3 = priceNumber1 - priceNumber2;
// ปัดราคา priceNumber1 ตามเงื่อนไขปัดขึ้นเป็น 100 หรือ 1000
const remainder100 = priceNumber1 % 100;

 if (remainder100 > 50) {
  priceNumber1 = priceNumber1 + (100 - remainder100);  // ปัดขึ้นเป็น 100
} else {
  priceNumber1 = priceNumber1 - remainder100;  // ปัดลงเป็น 100
}
console.log(`Transport Cost: ${priceNumber1}`);
console.log(`Cost: ${priceNumber2}`);
console.log(`GP: ${priceNumber3}`);
