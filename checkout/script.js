document.getElementById('Wastename').addEventListener('input', function() {
    const wastename = this.value.trim(); // Get the value from the input
  
    // If the input is not empty, make an AJAX request
    if (wastename.length > 0) {
      // Prepare data to send to the server
      const data = new FormData();
      data.append('wastename', wastename); // Append the wastename to the form data
  
      // Create an AJAX request to send to the server
      fetch('../fetch-data.php', {
        method: 'POST',
        body: data,
      })
      .then(response => response.json())  // Parse the JSON response from the server
      .then(data => {
        // Get the WasteCode select element
        const wasteCodeSelect = document.getElementById('WasteCode');
        const wasteOptions = document.getElementById('wasteOptions');
        // Clear any existing options in the select element
        wasteCodeSelect.innerHTML = '<option value="">กรุณาเลือก...</option>';
        wasteOptions.innerHTML = '';
        // Check if any data was returned
        if (data.waste_name && data.waste_name.length > 0) {
          // เติมข้อมูลใน datalist
          data.waste_name.forEach(waste => {
              const option = document.createElement('option');
              option.value = waste.waste_name;  // ตั้งค่า waste_name เป็น value
              wasteOptions.appendChild(option);
          });
      } else {
          // กรณีไม่มีข้อมูลที่ตรงกัน
          const option = document.createElement('option');
          option.value = 'No results found';
          wasteOptions.appendChild(option);
      }
        if (data.waste_codes && data.waste_codes.length > 0) {
          // Populate the select element with new options
          data.waste_codes.forEach(waste => {
            const option = document.createElement('option');
            option.value = waste.waste_code; // Set the waste_code as the option value average_cost_rate
            option.textContent = `${waste.waste_code}: ${waste.waste_name}`; // Set the waste_name as the option text
            wasteCodeSelect.appendChild(option); // Add the option to the select
          });
        } else {
          // Optionally handle no data found (e.g., show a message)
          const option = document.createElement('option');
          option.value = '';
          option.textContent = 'No results found';
          wasteCodeSelect.appendChild(option);
        }
      })
      .catch(error => {
        console.error('Error fetching data:', error);
      });
    } else {
      // Clear the select options if the input is empty
      document.getElementById('wasteOptions').innerHTML = '';
      document.getElementById('WasteCode').innerHTML = '<option value="">กรุณาเลือก...</option>';
    }
  });
  