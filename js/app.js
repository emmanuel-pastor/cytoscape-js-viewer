// Register the cytoscape-dagre extension
if (typeof cytoscape('layout', 'dagre') !== 'function') {
  cytoscape.use(cytoscapeDagre);
}

// Initialize Cytoscape instance
let cy = null;

// DOM elements
const fileUpload = document.getElementById('file-upload');
const resetButton = document.getElementById('reset-button');
const errorMessage = document.getElementById('error-message');
const cyContainer = document.getElementById('cy');
const noGraphMessage = document.getElementById('no-graph-message');

// Initialize the Cytoscape instance with default settings
function initCytoscape(elements) {
  // If there's an existing instance, destroy it
  if (cy) {
    cy.destroy();
  }

  // Check if elements array is empty
  const isEmpty = !elements ||
    (Array.isArray(elements) && elements.length === 0) ||
    (elements.nodes && elements.nodes.length === 0 && elements.edges && elements.edges.length === 0);

  // Show/hide the no graph message based on whether elements are provided
  if (isEmpty) {
    noGraphMessage.style.display = 'block';
    return; // Don't create Cytoscape instance if there are no elements
  } else {
    noGraphMessage.style.display = 'none';
  }

  // Create a new Cytoscape instance
  cy = cytoscape({
      container: cyContainer,
      elements: elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#4286f4',
            'label': 'data(label)',
            'text-valign': 'center',
            'text-halign': 'center',
            'color': '#fff',
            'text-outline-width': 2,
            'text-outline-color': '#4286f4',
            'width': 'data(size.width)',
            'height': 'data(size.height)'
          }
        },
        {
          selector: 'node[!label]',
          style: {
            'label': 'data(id)'
          }
        },
        {
          selector: 'edge',
          style: {
            'width': 3,
            'line-color': '#ccc',
            'curve-style': 'taxi',
            'label': 'data(label)',
            'text-rotation': 'autorotate',
            'text-margin-y': -10,
            'taxi-direction': "rightward",
            'taxi-turn': 40,
            'taxi-turn-min-distance': 5
          }
        },
        {
          selector: 'edge[!label]',
          style: {
            'label': ''
          }
        }
      ],
      layout: {
        name: 'preset',
        fit: true,
        padding: 50,
        animate: true,
        randomize: false,
      }
    }
  );

  // Fit the graph to the viewport
  cy.fit();
}

// Show error message
function showError(message) {
  errorMessage.textContent = message;
  errorMessage.style.display = 'block';
}

// Hide error message
function hideError() {
  errorMessage.style.display = 'none';
}

// Handle file upload
fileUpload.addEventListener('change', function (event) {
  const file = event.target.files[0];

  // Reset error message
  hideError();

  if (!file) {
    return;
  }

  // Check if the file is a JSON file
  if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
    showError('Please upload a valid JSON file.');
    return;
  }

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      // Parse the JSON data
      const jsonData = JSON.parse(e.target.result);

      // Check if the JSON has the expected Cytoscape.js format
      if (!jsonData.elements &&
        !(jsonData.nodes || jsonData.edges) &&
        !Array.isArray(jsonData)) {
        showError('The JSON file does not appear to be a valid Cytoscape.js format.');
        return;
      }

      // Handle different Cytoscape.js JSON formats
      let elements;

      if (jsonData.elements) {
        // Standard Cytoscape.js JSON format
        elements = jsonData.elements;
      } else if (jsonData.nodes || jsonData.edges) {
        // Format with separate nodes and edges arrays
        elements = {
          nodes: jsonData.nodes || [],
          edges: jsonData.edges || []
        };
      } else if (Array.isArray(jsonData)) {
        // Array format
        elements = jsonData;
      }

      // Initialize Cytoscape with the parsed data
      initCytoscape(elements);
    } catch (error) {
      showError('Error parsing the JSON file: ' + error.message);
    }
  };

  reader.onerror = function () {
    showError('Error reading the file.');
  };

  // Read the file as text
  reader.readAsText(file);
});

// Reset the graph to empty state
function resetGraph() {
  // Clear the file input
  fileUpload.value = '';

  // Hide any error messages
  hideError();

  // Initialize with an empty graph
  initCytoscape([]);
}

// Event listener for reset button
resetButton.addEventListener('click', resetGraph);

// Initialize when the DOM is loaded
document.addEventListener('DOMContentLoaded', function () {
  // Show the no-graph message initially
  noGraphMessage.style.display = 'block';

  // Initialize with an empty graph
  initCytoscape([]);
});
