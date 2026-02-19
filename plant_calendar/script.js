let plantData = [];
let frostDate;
let selectedPlantIds = new Set();
let activeActions = new Set(['sowIndoors','sowOutdoors','transplant','harvest']);

// ---------- INIT ----------
document.addEventListener('DOMContentLoaded', () => {
  selectedPlantIds.clear();
  loadPlantData();
  setupFrostDateInput();
  renderActionLegend();
  setupClearSelectionButton();
  renderPlantOptions();
  setupRestoreDefaultsButton();
  setupCustomPlantForm();
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

//setup plant form
function setupCustomPlantForm() {
  const form = document.getElementById('custom-plant-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    addCustomPlant();
  });
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
  const inputEl = document.getElementById('frost-date-input');
  inputEl.addEventListener('change', () => {
    const input = inputEl.value;
    if (!input) return;

    frostDate = new Date(input);
    localStorage.setItem('userFrostDate', input);
    generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);
  });
}

//clear selected plants
function setupClearSelectionButton() {
  const btn = document.getElementById('clear-selection-btn');
  
  btn.addEventListener('click', () => {
    // Clear internal selection state
    selectedPlantIds.clear();

    // Uncheck all plant checkboxes
    const checkboxes = document.querySelectorAll('#plant-options input[type="checkbox"]');
    checkboxes.forEach(cb => cb.checked = false);

    // Re-render calendar
    generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);
  });
}

//Restore default plants
function setupRestoreDefaultsButton() {
  const btn = document.getElementById('restore-defaults-btn');
  btn.addEventListener('click', () => {
    fetch('plants.json')
      .then(res => res.json())
      .then(defaultPlants => {
        // keep only user-added plants (ids starting with 'custom-')
        const userPlants = plantData.filter(p => p.id.startsWith('custom-'));
        plantData = [...userPlants, ...defaultPlants];
        renderPlantOptions();
        generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);
      })
      .catch(err => console.error('Error restoring default plants:', err));
  });
}

//action selection/legend
function renderActionLegend() {
  const container = document.getElementById('action-legend');
  container.innerHTML = '';

  Object.keys(actionColors).forEach(action => {
    const item = document.createElement('label');
    item.style.marginRight = '15px';
    item.style.cursor = 'pointer';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.checked = activeActions.has(action);

    checkbox.addEventListener('change', () => {
      if (checkbox.checked) {
        activeActions.add(action);
      } else {
        activeActions.delete(action);
      }
      generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);
    });

    const colorBox = document.createElement('span');
    colorBox.classList.add('action-legend');
    colorBox.style.backgroundColor = actionColors[action];

    item.appendChild(checkbox);
    item.appendChild(colorBox);
    item.appendChild(document.createTextNode(actionLabels[action]));
    container.appendChild(item);
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

//creating tooltip on hover
function createTooltip(plantName, action) {
  const actionText = actionLabels[action] || action;
  return `${plantName} – ${actionText}`;
}

// Function to place the icon or placeholder
function placeIcon(container, color, icon, action, plantName, altText) {
  const wrapper = document.createElement('span');
  wrapper.style.position = 'relative';

  const tooltipText = createTooltip(plantName, action);

  const img = new Image();
  img.src = `icons/${icon}.svg`;
  img.className = "calendar-icon";
  img.style.border = `2px solid ${color}`;

  const tooltip = document.createElement('div');
  tooltip.className = 'custom-tooltip';
  tooltip.style.border = `2px solid ${color}`;
  tooltip.textContent = tooltipText;

  wrapper.appendChild(img);
  wrapper.appendChild(tooltip);
  container.appendChild(wrapper);

  img.onerror = function () {
    img.remove();
    wrapper.textContent = altText || plantName.slice(0,3).toUpperCase();
    wrapper.classList.add('calendar-placeholder');
    wrapper.style.border = `2px solid ${color}`;
    wrapper.appendChild(tooltip);
  };
}

// Action → color mapping
const actionColors = {
  sowIndoors: 'blue',
  sowOutdoors: 'green',
  transplant: 'mediumturquoise',
  harvest: 'red'
};
//Action → text mapping
const actionLabels = {
  sowIndoors: "Sow Indoors",
  sowOutdoors: "Sow Outdoors",
  transplant: "Transplant",
  harvest: "Harvest"
};

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
  header.style.backgroundColor = monthColors[month-1];
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

    const dayNumber = document.createElement('div');
    dayNumber.classList.add('calendar-day-number');
    dayNumber.textContent = day;

    const iconsContainer = document.createElement('div');
    iconsContainer.classList.add('calendar-icons');

    dayDiv.appendChild(dayNumber);
    dayDiv.appendChild(iconsContainer);
    grid.appendChild(dayDiv);

    //placing frost date icon into the calendar with a custom tooltip on hover
    if (frostDate.getDate() === day && frostDate.getMonth() === month - 1 && frostDate.getFullYear() === year) {
        const frostWrapper = document.createElement('span');
        frostWrapper.style.position = 'relative';
        frostWrapper.textContent = '❄️';
        frostWrapper.classList.add('frost-icon');
    
        const frostTooltip = document.createElement('div');
        frostTooltip.className = 'custom-tooltip';
        frostTooltip.style.border = `2px solid #a0e0ff`;
        frostTooltip.textContent = 'Last Frost Date';
    
        frostWrapper.appendChild(frostTooltip);
        iconsContainer.appendChild(frostWrapper);
    }

    // Place icons for each selected plant
    selectedPlants.forEach(plant => {
      const dates = {
        sowIndoors: getEventDate(frostDate, plant.sow_indoor),
        sowOutdoors: getEventDate(frostDate, plant.sow_outdoor),
        transplant: getEventDate(frostDate, plant.transplant),
        harvest: getEventDate(frostDate, plant.harvest)
      };

      for (const [action, date] of Object.entries(dates)) {
        if (!activeActions.has(action)) continue;
        if (date && date.getDate() === day && date.getMonth() === month - 1) {
          placeIcon(iconsContainer, actionColors[action], plant.icon, action, plant.name, plant.alternate_text);
        }
      }
    });
  }
  // Append the completed month div once
  document.getElementById('calendar-container').appendChild(monthDiv);
}
//PLANT SELECTION
function renderPlantOptions() {
  const container = document.getElementById('plant-options');
  container.innerHTML = '';

  // Sort the plants alphabetically by name
  const sortedPlants = [...plantData].sort((a, b) => a.name.localeCompare(b.name));

  sortedPlants.forEach(plant => {
    const div = document.createElement('div');
    // checkbox
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
    //plant names
    const label = document.createElement('label');
    label.htmlFor = `plant-${plant.id}`;
    label.textContent = plant.name;

    // red × delete button
    const deleteBtn = document.createElement('span');
    deleteBtn.textContent = '×';
    deleteBtn.classList.add('plant-delete');
    deleteBtn.title = 'Remove';
    deleteBtn.addEventListener('click', () => {
      // remove from plantData
      const index = plantData.findIndex(p => p.id === plant.id);
      if (index !== -1) plantData.splice(index, 1);
      selectedPlantIds.delete(plant.id);
      renderPlantOptions();
      generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);
    });
    
    div.appendChild(checkbox);
    div.appendChild(label);
    div.appendChild(deleteBtn);
    container.appendChild(div);
  });
}

//ADD CUSTOM PLANT
function addCustomPlant() {
  const name = document.getElementById('plant-name').value.trim();
  if (!name) return; // require name

  const sun = document.getElementById('sun-needs').value.trim() || '';
  const water = document.getElementById('water-needs').value.trim() || '';
  const sowIndoor = parseInt(document.getElementById('sow-indoor').value, 10) || null;
  const sowOutdoor = parseInt(document.getElementById('sow-outdoor').value, 10) || null;
  const transplant = parseInt(document.getElementById('transplant').value, 10) || null;
  const harvest = parseInt(document.getElementById('harvest').value, 10) || null;
  const icon = document.getElementById('plant-icon').value.trim() || name.slice(0,3).toUpperCase();

  const newPlant = {
    id: 'custom-' + Date.now(),
    name,
    sun,
    water,
    sow_indoor: sowIndoor != null ? sowIndoor * -7 : null,   // negative weeks → days
    sow_outdoor: sowOutdoor != null ? sowOutdoor * 7 : null,
    transplant: transplant != null ? transplant * 7 : null,
    harvest: harvest != null ? harvest * 7 : null,
    icon
  };

  plantData.push(newPlant);

  renderPlantOptions();
  generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);

  document.getElementById('custom-plant-form').reset();
}

//nuke the session
function setupClearSessionButton() {
  const btn = document.getElementById('clear-session-btn');
  btn.addEventListener('click', () => {
    localStorage.clear();           // clears frost date, etc.
    selectedPlantIds.clear();       // unselect all plants
    loadPlantData();                // reload default plants
    renderPlantOptions();
    generateYearCalendar(frostDate.getFullYear(), plantData, frostDate);
  });
}



