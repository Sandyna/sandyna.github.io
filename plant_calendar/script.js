// script.js

// Function to fetch plant data (same as before)
async function loadPlantData() {
  try {
    const response = await fetch('plants.json');
    const plantData = await response.json();
    generateCalendar(3, 2026, plantData);  // Pass the plant data to the calendar function
  } catch (error) {
    console.error('Error loading plant data:', error);
  }
}

// Function to generate the calendar grid
function generateCalendar(month, year, plantData) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  const calendarContainer = document.getElementById('calendar-container');
  calendarContainer.innerHTML = '';  // Clear previous content

  // Add header with month name
  const header = document.createElement('div');
  header.classList.add('calendar-header');
  header.textContent = `${monthName} ${year}`;
  calendarContainer.appendChild(header);

  // Add the calendar grid
  const grid = document.createElement('div');
  grid.classList.add('calendar-grid');
  calendarContainer.appendChild(grid);

  // Loop through the days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('calendar-day');
    dayDiv.setAttribute('data-day', day);
    dayDiv.textContent = day;

    grid.appendChild(dayDiv);

    // Add plant icons based on sowing/transplanting dates
    plantData.forEach(plant => {
      const sowIndoorsDate = new Date(frostDate);
      sowIndoorsDate.setDate(sowIndoorsDate.getDate() + plant.sow_indoor);

      const sowOutdoorsDate = new Date(frostDate);
      sowOutdoorsDate.setDate(sowOutdoorsDate.getDate() + plant.sow_outdoor);

      const transplantDate = new Date(frostDate);
      transplantDate.setDate(transplantDate.getDate() + plant.transplant);

      // Place icons if the day matches any plant date
      if (sowIndoorsDate.getDate() === day) placeIcon(dayDiv, 'blue', plant.icon, 'Sow Indoors', plant.name);
      if (sowOutdoorsDate.getDate() === day) placeIcon(dayDiv, 'brown', plant.icon, 'Sow Outdoors', plant.name);
      if (transplantDate.getDate() === day) placeIcon(dayDiv, 'green', plant.icon, 'Transplant', plant.name);
    });
  }
}

// Helper function to add icons to calendar days
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

// Frost date example (can be dynamically set)
const frostDate = new Date("2026-03-15");

// Load the plant data and generate the calendar
loadPlantData();
