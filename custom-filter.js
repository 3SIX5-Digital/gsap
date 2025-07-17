// Wait for the DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function() {

  // Get all the organ cells
  const organCells = document.querySelectorAll('.organ-cell-wrapper');

  // Get the modal
  const modal = document.querySelector('.detection-section-back');

  // Get the filter buttons
  const filterButtons = document.querySelectorAll('.filter-button'); // Please adjust this selector

  // Get the content wrapper
  const contentWrapper = document.querySelector('.content-wrapper'); // Please adjust this selector

  // Get the search input
  const searchInput = document.getElementById('search-input');

  // Add a click event listener to each organ cell
  organCells.forEach(cell => {
    cell.addEventListener('click', function() {
      // Get the filter value from the custom attribute
      const filterValue = this.getAttribute('data-filter');

      // Open the modal
      modal.style.display = 'block';

      // Set the active filter
      setActiveFilter(filterValue);

      // Filter the content
      filterContent(filterValue);
    });
  });

  // Add a click event listener to each filter button
  filterButtons.forEach(button => {
    button.addEventListener('click', function() {
      // Get the filter value from the custom attribute
      const filterValue = this.getAttribute('data-filter');

      // Set the active filter
      setActiveFilter(filterValue);

      // Filter the content
      filterContent(filterValue);
    });
  });

  // Function to set the active filter
  function setActiveFilter(filter) {
    filterButtons.forEach(button => {
      if (button.getAttribute('data-filter') === filter) {
        button.classList.add('active');
      } else {
        button.classList.remove('active');
      }
    });
  }

  // Function to filter the content
  function filterContent(filter) {
    const filterItems = contentWrapper.querySelectorAll('.conditions-section-block');
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
      const activeFilter = document.querySelector('.filter-button.active').getAttribute('data-filter');

      const filterItems = contentWrapper.querySelectorAll('.conditions-section-block');
      filterItems.forEach(item => {
        if (item.getAttribute('data-category') === activeFilter) {
          const itemText = item.textContent.toLowerCase();
          if (itemText.includes(searchValue)) {
            item.style.display = 'block';
          } else {
            item.style.display = 'none';
          }
        }
      });
    });
  }

  // Add a click event listener to the close button of the modal
  const closeButton = document.querySelector('.modal-close-button');
  if (closeButton) {
    closeButton.addEventListener('click', function() {
      modal.style.display = 'none';
    });
  }
});
