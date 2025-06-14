const categories = [
  'Accessories',
  'Beauty & Personal Care',
  'Computers',
  'Electronics',
  'Fashion',
  'Home & Living',
  'Photography',
  'Sex and Wellness',
  'Wearables'
];

async function createCategories() {
  const token = localStorage.getItem('token');
  
  for (const categoryName of categories) {
    try {
      const response = await fetch('http://localhost:5000/api/admin/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name: categoryName })
      });

      if (!response.ok) {
        const error = await response.json();
        console.error(`Failed to create category ${categoryName}:`, error.message);
      } else {
        console.log(`Created category: ${categoryName}`);
      }
    } catch (error) {
      console.error(`Error creating category ${categoryName}:`, error);
    }
  }
}

// Execute the function
createCategories(); 