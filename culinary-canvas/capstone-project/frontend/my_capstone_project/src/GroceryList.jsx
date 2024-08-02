import React, { useState, useEffect } from "react";
import { useAuth } from "./RedirectToAuthentication";

function GroceryList() {
  const { user } = useAuth();
  const [groceryItems, setGroceryItems] = useState([]);
  const [newItem, setNewItem] = useState({ itemName: "", quantity: 1 });
  const backendAddress = import.meta.env.VITE_BACKEND_ADDRESS;

  useEffect(() => {
    const fetchGroceryItems = async () => {
      try {
        const response = await fetch(`${backendAddress}/grocery/${user.id}`);
        const data = await response.json();
        setGroceryItems(data);
      } catch (error) {
        console.error("Error fetching grocery items: ", error);
      }
    };
    if (user) {
      fetchGroceryItems();
    }
  }, [user]);

  const handleAddItem = async () => {
    if (!newItem.itemName || newItem.quantity <= 0) {
      alert("Please enter a valid item name and quantity.");
      return;
    }
    try {
      const response = await fetch(`${backendAddress}/grocery`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, ...newItem }),
      });
      const addedItem = await response.json();
      setGroceryItems([...groceryItems, addedItem]);
      setNewItem({ itemName: "", quantity: 1 });
    } catch (error) {
      console.error("Error adding grocery item: ", error);
    }
  };

  const handleUpdateItem = async (id, updatedItem) => {
    try {
      const respnse = await fetch(`${backendAddress}/grocery/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedItem),
      });
      const updatedItemData = await respnse.json();
      setGroceryItems(
        groceryItems.map((item) => (item.id === id ? updatedItemData : item))
      );
    } catch (error) {
      console.error("Error updating grocery item: ", error);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await fetch(`${backendAddress}/grocery/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
      });
      setGroceryItems(groceryItems.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Error deleting grocery item: ", error);
    }
  };

  const QuantityChange = (e, id) => {
    const value = parseInt(e.target.value, 10);
    if (isNaN(value) || value <= 0) {
      alert("Please enter a valid number");
      return;
    }
    handleUpdateItem(id, {
      ...groceryItems.find((item) => item.id === id),
      quantity: value,
    });
  };

  return (
    <div className="grocery-list">
      <div className="grocery-list-item">
        <input
          type="text"
          placeholder="Item Name"
          value={newItem.itemName}
          onChange={(e) => setNewItem({ ...newItem, itemName: e.target.value })}
          required
          className="grocery-list-input"
        />
        <input
          type="number"
          value={newItem.itemName}
          onChange={(e) =>
            setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 1 })
          }
          required
          className="grocery-list-input"
        />
        <button onClick={handleAddItem} className="add-items">Add</button>
      </div>
      <ul>
        {groceryItems.length === 0 ? (
          <p>No items in your grocery list</p>
        ) : (
          groceryItems.map((item) => (
            <li key={item.id} className="grocery-list-items">
              <input
                type="text"
                value={item.itemName}
                className="grocery-list-text"
                onChange={(e) =>
                  handleUpdateItem(item.id, {
                    ...item,
                    itemName: e.target.value,
                  })
                }
                required
              />
              <input
                type="number"
                value={item.quantity}
                onChange={(e) => QuantityChange(e, item.id)}
                required
              />
              <button onClick={() => handleDeleteItem(item.id)} className="delete-grocery-item">Delete</button>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
export default GroceryList;
