async function loadPlantData() {
  try {
    const response = await fetch('plants.json');
    const plantData = await response.json();
    generateYearCalendar(2026, plantData, new Date("2026-03-15"));  // Pass the plant data and frost date to the calendar generation
  } catch (error) {
    console.error('Error loading plant data:', error);
  }
}

// Function to generate the full year calendar (12 months)
function generateYearCalendar(year, plantData, frostDate) {
  const calendarContainer = document.getElementById('calendar-container');
  calendarContainer.innerHTML = '';  // Clear any existing content

  // Loop through all 12 months
  for (let month = 1; month <= 12; month++) {
    generateCalendar(month, year, plantData, frostDate);
  }
}

// Function to generate each month's calendar
function generateCalendar(month, year, plantData, frostDate) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  const monthDiv = document.createElement('div');
  monthDiv.classList.add('calendar-month');

  // Add month header (e.g., "January", "February", etc.)
  const header = document.createElement('div');
  header.classList.add('calendar-header');
  header.textContent = monthName;
  monthDiv.appendChild(header);

  // Create the grid for the calendar
  const grid = document.createElement('div');
  grid.classList.add('calendar-grid');
  monthDiv.appendChild(grid);

  // Loop through each day in the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('calendar-day');
    dayDiv.setAttribute('data-day', day);
    dayDiv.textContent = day;

    grid.appendChild(dayDiv);

    // Add plant icons based on sowing/transplanting dates
    plantData.forEach(plant => {
      // Calculate sowing indoors date relative to the frost date
      const sowIndoorsDate = calculateSowingIndoorsDate(frostDate, plant.sow_indoor);

      // Calculate sowing outdoors date relative to the frost date
      const sowOutdoorsDate = new Date(frostDate);
      sowOutdoorsDate.setDate(sowOutdoorsDate.getDate() + plant.sow_outdoor);

      // Calculate transplant date relative to the frost date
      const transplantDate = new Date(frostDate);
      transplantDate.setDate(transplantDate.getDate() + plant.transplant);

      // Check if sowing indoors date matches both the day and the month
      if (sowIndoorsDate.getDate() === day && sowIndoorsDate.getMonth() === month - 1) {
        placeIcon(dayDiv, 'blue', plant.icon, 'Sow Indoors', plant.name);
      }

      // Check if sowing outdoors date matches both the day and the month
      if (sowOutdoorsDate.getDate() === day && sowOutdoorsDate.getMonth() === month - 1) {
        placeIcon(dayDiv, 'brown', plant.icon, 'Sow Outdoors', plant.name);
      }

      // Check if transplant date matches both the day and the month
      if (transplantDate.getDate() === day && transplantDate.getMonth() === month - 1) {
        placeIcon(dayDiv, 'green', plant.icon, 'Transplant', plant.name);
      }
    });
  }

  // Append the month calendar to the year container
  document.getElementById('calendar-container').appendChild(monthDiv);
}

// Function to calculate sowing indoors date relative to frost date
function calculateSowingIndoorsDate(frostDate, weeksBefore) {
  const sowIndoorsDate = new Date(frostDate);
  sowIndoorsDate.setDate(sowIndoorsDate.getDate() + weeksBefore * 7);  // Add or subtract weeks from frost date
  return sowIndoorsDate;
}

function placeIcon(dayDiv, color, icon, action, plantName) {
  const iconElement = document.createElement('span');
  
  // Check if the plant icon file exists
  const img = new Image();
  img.src = `icons/${icon}.png`;  // Check if the icon exists
  
  img.onload = function () {
    // If the icon exists, use the image
    iconElement.innerHTML = `<img src="${img.src}" class="plant-icon" style="border: 2px solid ${color}" title="${action}: ${icon}">`;
    dayDiv.appendChild(iconElement);
  };
  
  img.onerror = function () {
    // If the icon doesn't exist, use the first 3 letters of the plant name
    iconElement.textContent = plantName.slice(0, 3).toUpperCase();  // Display first 3 letters
    iconElement.style.border = `2px solid ${color}`;  // Border color for sowing/transplanting action
    dayDiv.appendChild(iconElement);
  };
}

// Load the plant data and generate the full year calendar
loadPlantData();
