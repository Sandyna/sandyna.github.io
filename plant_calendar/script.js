let plantData = [];
let frostDate;
let selectedPlantIds = new Set();

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  selectedPlantIds.clear();
  loadPlantData();
  setupFrostDateInput();
  renderPlantOptions();
});

// ---------- LOAD PLANT DATA ----------
async function loadPlantData() {
  try {
    const response = await fetch('plants.json');
    plantData = await response.json();

    loadFrostDate();
    renderPlantOptions();    // checkboxes
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

  //filter selected plants
  const selectedPlants = plantData.filter(plant => selectedPlantIds.has(plant.id));
  
  // Loop through all 12 months
  for (let month = 1; month <= 12; month++) {
    renderMonth(month, year, selectedPlants, frostDate); // pass filtered list
  }
}

//get date
function getEventDate(baseDate, offset) {
if (offset === null || offset === undefined) return null;
const d = new Date(baseDate);
d.setDate(d.getDate() + offset);
return d;
}

//create one month of the calendar
function renderMonth(month, year, selectedPlants, frostDate) {
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
    
    // Day number
    const dayNumber = document.createElement('div');
    dayNumber.classList.add('calendar-day-number');
    dayNumber.textContent = day;
    
    // Icons container
    const iconsContainer = document.createElement('div');
    iconsContainer.classList.add('calendar-icons');
    
    dayDiv.appendChild(dayNumber);
    dayDiv.appendChild(iconsContainer);
    grid.appendChild(dayDiv);
    
    // Place plant icons
    selectedPlants.forEach(plant => {
      const sowIndoorsDate = getEventDate(frostDate, plant.sow_indoor);
      const sowOutdoorsDate = getEventDate(frostDate, plant.sow_outdoor);
      const transplantDate = getEventDate(frostDate, plant.transplant);
      const harvestDate = getEventDate(frostDate, plant.harvest);

      if (sowIndoorsDate && sowIndoorsDate.getDate() === day && sowIndoorsDate.getMonth() === month - 1) {
        placeIcon(iconsContainer, 'blue', plant.icon, 'Sow Indoors', plant.name, plant.alternate_text);
      }
      if (sowOutdoorsDate && sowOutdoorsDate.getDate() === day && sowOutdoorsDate.getMonth() === month - 1) {
        placeIcon(iconsContainer, 'orange', plant.icon, 'Sow Outdoors', plant.name, plant.alternate_text);
      }
      if (transplantDate && transplantDate.getDate() === day && transplantDate.getMonth() === month - 1) {
        placeIcon(iconsContainer, 'green', plant.icon, 'Transplant', plant.name, plant.alternate_text);
      }
      if (harvestDate && harvestDate.getDate() === day && harvestDate.getMonth() === month - 1) {
        placeIcon(iconsContainer, 'red', plant.icon, 'Harvest', plant.name, plant.alternate_text);
      }
    });
  //    document.getElementById('calendar-container').appendChild(monthDiv);
  }
  
// Function to place the icon or placeholder
function placeIcon(container, color, icon, action, plantName, altText) {
  const iconElement = document.createElement('span');
  const img = new Image();
  img.src = `icons/${icon}.svg`;

  img.onload = function () {
    iconElement.innerHTML = `<img src="${img.src}" class="calendar-icon" style="border: 2px solid ${color}" title="${action}: ${icon}">`;
    container.appendChild(iconElement);
  };

  img.onerror = function () {
    // Use altText if available, else first 3 letters of plantName
    iconElement.textContent = altText || plantName.slice(0, 3).toUpperCase();
    iconElement.classList.add('calendar-placeholder');
    iconElement.style.border = `2px solid ${color}`;
    container.appendChild(iconElement);
  };
}

  document.getElementById('calendar-container').appendChild(monthDiv);
}
//ICON SET SELECTION
//function renderIconOptions() {
//  const container = document.getElementById('icon-set-options');
//  container.innerHTML = '';
//}

//PLANT SELECTION
function renderPlantOptions() {
  const container = document.getElementById('plant-options');
  container.innerHTML = '';

  // Sort the plants alphabetically by name
  const sortedPlants = [...plantData].sort((a, b) => a.name.localeCompare(b.name));

  sortedPlants.forEach(plant => {
    const div = document.createElement('div');
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `plant-${plant.id}`;
    checkbox.checked = selectedPlantIds.has(plant.id);
    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        selectedPlantIds.add(plant.id);
      } else {
        selectedPlantIds.delete(plant.id);
      }
      generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);
    });

    const label = document.createElement('label');
    label.htmlFor = `plant-${plant.id}`;
    label.textContent = plant.name;

    div.appendChild(checkbox);
    div.appendChild(label);
    container.appendChild(div);
  });
}









