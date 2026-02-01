let plantData = [];
let frostDate;

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  loadPlantData();
  setupFrostDateInput();
});

// ---------- LOAD PLANT DATA ----------
async function loadPlantData() {
  try {
    const response = await fetch('plants.json');
    plantData = await response.json();

    loadFrostDate();
    generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);
  } catch (error) {
    console.error('Error loading plant data:', error);
  }
}

// ---------- FROST DATE ----------
function loadFrostDate() {
  const saved = localStorage.getItem('userFrostDate');
  //check for frostDate, use default if not present
  frostDate = saved ? new Date(saved) : new Date('2026-03-15');

  document.getElementById('frost-date-input').value =
    frostDate.toISOString().split('T')[0];
}
//setup the button and input for frost date
function setupFrostDateInput() {
  document.getElementById('update-frost-date').addEventListener('click', () => {
    const input = document.getElementById('frost-date-input').value;
    if (!input) return;

    frostDate = new Date(input);
    localStorage.setItem('userFrostDate', input);
    generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);
  });
}

// ---------- CALENDAR ----------
function generateYearCalendar(year, plantData, frostDate) {
  const calendarContainer = document.getElementById('calendar-container');
  calendarContainer.innerHTML = ''; // Clear existing calendar
  
  // Loop through all 12 months
  for (let month = 1; month <= 12; month++) {
    renderMonth(month, year, plantData, frostDate);
  }
}

//create one month of the calendar
function renderMonth(month, year, plantData, frostDate) {
  const daysInMonth = new Date(year, month, 0).getDate();
  const monthName = new Date(year, month - 1).toLocaleString('default', { month: 'long' });

  const monthDiv = document.createElement('div');
  monthDiv.classList.add('calendar-month');

  // Month header
  const header = document.createElement('div');
  header.classList.add('calendar-header');
  const monthColors = ['#ccecff', '#99ccff', '#32cccc', '#ccffcc', '#5dcc00', '#ffff99', '#ffcc00', '#ff9900', '#ff6500', '#ff7b80', '#cc99ff', '#ccccff'];
  header.style.backgroundColor = monthColors[month-1]
  header.textContent = monthName;
  monthDiv.appendChild(header);

  // Calendar grid
  const grid = document.createElement('div');
  grid.classList.add('calendar-grid');
  monthDiv.appendChild(grid);

  // Days
  for (let day = 1; day <= daysInMonth; day++) {
    const dayDiv = document.createElement('div');
    dayDiv.classList.add('calendar-day');
    dayDiv.setAttribute('data-day', day);
    dayDiv.textContent = day;
    grid.appendChild(dayDiv);

    // Place plant icons
    plantData.forEach(plant => {
      const sowIndoorsDate = new Date(frostDate); sowIndoorsDate.setDate(sowIndoorsDate.getDate() + plant.sow_indoor);
      const sowOutdoorsDate = new Date(frostDate); sowOutdoorsDate.setDate(sowOutdoorsDate.getDate() + plant.sow_outdoor);
      const transplantDate = new Date(frostDate); transplantDate.setDate(transplantDate.getDate() + plant.transplant);

      if (sowIndoorsDate.getDate() === day && sowIndoorsDate.getMonth() === month - 1) {
        placeIcon(dayDiv, 'blue', plant.icon, 'Sow Indoors', plant.name, plant.alternate_text);
      }
      if (sowOutdoorsDate.getDate() === day && sowOutdoorsDate.getMonth() === month - 1) {
        placeIcon(dayDiv, 'brown', plant.icon, 'Sow Outdoors', plant.name, plant.alternate_text);
      }
      if (transplantDate.getDate() === day && transplantDate.getMonth() === month - 1) {
        placeIcon(dayDiv, 'green', plant.icon, 'Transplant', plant.name, plant.alternate_text);
      }
    });
  }
  
// Function to place the icon or placeholder
function placeIcon(dayDiv, color, icon, action, plantName, altText) {
  const iconElement = document.createElement('span');
  const img = new Image();
  img.src = `icons/${icon}.svg`;

  img.onload = function () {
    iconElement.innerHTML = `<img src="${img.src}" class="calendar-icon" style="border: 2px solid ${color}" title="${action}: ${icon}">`;
    dayDiv.appendChild(iconElement);
  };

  img.onerror = function () {
    // Use altText if available, else first 3 letters of plantName
    iconElement.textContent = altText || plantName.slice(0, 3).toUpperCase();
    iconElement.classList.add('calendar-placeholder');
    iconElement.style.border = `2px solid ${color}`;
    dayDiv.appendChild(iconElement);
  };
}

  document.getElementById('calendar-container').appendChild(monthDiv);
}












