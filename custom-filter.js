// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {

  // Get all the organ cells
  const organCells = document.querySelectorAll('.organ-cell-wrapper');

  // Get the modal and the filterable content
  const modal = document.querySelector('.modal-wrapper'); // Please adjust this selector to match your modal
  const filterItems = document.querySelectorAll('.filter-item'); // Please adjust this selector to match your filterable items

  // Get the search input
  const searchInput = document.getElementById('search-input'); // Please adjust this ID to match your search input

  // Add a click event listener to each organ cell
  organCells.forEach(cell => {
    cell.addEventListener('click', function() {
      // Get the filter value from the custom attribute
      const filterValue = this.getAttribute('data-filter');

      // Open the modal
      modal.style.display = 'block';

      // Filter the content
      filterContent(filterValue);
    });
  });

  // Function to filter the content
  function filterContent(filter) {
    filterItems.forEach(item => {
      if (filter === 'all' || item.getAttribute('data-category') === filter) {
        item.style.display = 'block';
      } else {
        item.style.display = 'none';
      }
    });
  }

  // Add an event listener to the search input
  if (searchInput) {
    searchInput.addEventListener('keyup', function() {
      const searchValue = this.value.toLowerCase();

      filterItems.forEach(item => {
        const itemText = item.textContent.toLowerCase();
        if (itemText.includes(searchValue)) {
          item.style.display = 'block';
        } else {
          item.style.display = 'none';
        }
      });
    });
  }

  // Add a click event listener to the close button of the modal
  const closeButton = document.querySelector('.modal-close-button'); // Please adjust this selector to match your close button
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      modal.style.display = 'none';
    });
  }
});
