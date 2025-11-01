let items = [];
let filteredItems = [];

// Fetch all items
async function fetchItems() {
  try {
    items = await apiCall('/items');
    filteredItems = [...items];
    renderItems();
    updateItemCount();
  } catch (error) {
    console.error('Error fetching items:', error);
  }
}

// Render items table
function renderItems() {
  const tbody = document.querySelector('#itemsTable tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  
  filteredItems.forEach(item => {
    const row = document.createElement('tr');
    row.className = 'fade-in';
    row.innerHTML = `
      <td><strong>${item.item_name}</strong></td>
      <td><span class="badge" style="background: var(--light-brown); color: var(--brown);">${item.type}</span></td>
      <td>${item.weight}g</td>
      <td><strong>${formatCurrency(item.price)}</strong></td>
      <td>
        <span class="badge ${item.stock < 5 ? 'bg-danger' : 'bg-success'}">
          ${item.stock}
        </span>
      </td>
      <td>
        <button class="btn btn-outline-gold btn-sm me-1" onclick="editItem(${item.item_id})">
          <i class="fas fa-edit"></i>
        </button>
        <button class="btn btn-outline-danger btn-sm" onclick="deleteItem(${item.item_id})">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// Update item count
function updateItemCount() {
  const countElement = document.getElementById('itemCount');
  if (countElement) {
    countElement.textContent = `${filteredItems.length} items`;
  }
}

// Save item (create or update)
async function saveItem(e) {
  e.preventDefault();
  
  const itemData = {
    item_name: document.getElementById('itemName').value.trim(),
    type: document.getElementById('itemType').value.trim(),
    weight: parseFloat(document.getElementById('itemWeight').value) || 0,
    price: parseFloat(document.getElementById('itemPrice').value),
    stock: parseInt(document.getElementById('itemStock').value)
  };

  const itemId = document.getElementById('itemId').value;

  try {
    if (itemId) {
      // Update existing item
      await apiCall(`/items/${itemId}`, {
        method: 'PUT',
        body: JSON.stringify(itemData)
      });
    } else {
      // Create new item
      await apiCall('/items', {
        method: 'POST',
        body: JSON.stringify(itemData)
      });
    }

    clearItemForm();
    await fetchItems();
    showMessage('itemMessage', `Item ${itemId ? 'updated' : 'added'} successfully!`);
  } catch (error) {
    showMessage('itemMessage', 'Error saving item. Please try again.', 'error');
  }
}

// Edit item
function editItem(id) {
  const item = items.find(i => i.item_id === id);
  if (!item) return;

  document.getElementById('itemId').value = item.item_id;
  document.getElementById('itemName').value = item.item_name;
  document.getElementById('itemType').value = item.type;
  document.getElementById('itemWeight').value = item.weight;
  document.getElementById('itemPrice').value = item.price;
  document.getElementById('itemStock').value = item.stock;

  // Scroll to form
  document.getElementById('itemForm').scrollIntoView({ behavior: 'smooth' });
}

// Delete item
async function deleteItem(id) {
  if (!confirm('Are you sure you want to delete this item?')) return;

  try {
    await apiCall(`/items/${id}`, { method: 'DELETE' });
    await fetchItems();
    showMessage('itemMessage', 'Item deleted successfully!');
  } catch (error) {
    showMessage('itemMessage', 'Error deleting item. Please try again.', 'error');
  }
}

// Clear item form
function clearItemForm() {
  clearForm('itemForm');
}

// Search items
function searchItems() {
  const query = document.getElementById('itemSearch').value.toLowerCase().trim();
  
  if (!query) {
    filteredItems = [...items];
  } else {
    filteredItems = items.filter(item =>
      item.item_name.toLowerCase().includes(query) ||
      item.type.toLowerCase().includes(query)
    );
  }
  
  renderItems();
  updateItemCount();
}

// Event listeners
document.addEventListener('DOMContentLoaded', function() {
  const itemForm = document.getElementById('itemForm');
  const itemSearch = document.getElementById('itemSearch');

  if (itemForm) {
    itemForm.addEventListener('submit', saveItem);
  }

  if (itemSearch) {
    itemSearch.addEventListener('input', searchItems);
  }

  // Add message container
  if (itemForm && !document.getElementById('itemMessage')) {
    const messageDiv = document.createElement('div');
    messageDiv.id = 'itemMessage';
    itemForm.parentNode.insertBefore(messageDiv, itemForm.nextSibling);
  }
});
