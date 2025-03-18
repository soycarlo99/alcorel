import { useEffect, useState } from "react";

export default function EditCategories() {
  const [categories, setCategories] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [newCatName, setNewCatName] = useState("");

  useEffect(() => {
    GetCategory();
  }, []);

  async function GetCategory() {
    try {
      const response = await fetch("/api/GetCategory");
      const body = await response.json();
      setCategories(body);
    } catch (error) {
      console.error(error);
    }
  }

  function handleAddSubmit(event) {
    event.preventDefault();
    let data = new FormData(event.target);
    data = Object.fromEntries(data);
    data = JSON.stringify(data);

    fetch("/api/PostCategory", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: data,
    }).then((response) => {
      if (response.ok) {
        GetCategory();
        console.log("Category Added Successfully");
        event.target.reset();
      }
    });
  }

  function showEdit(id, currentName) {
    setEditingId(id);
    setNewCatName(currentName);
  }

  async function handleCatEditSubmit(event) {
    event.preventDefault();
    const form = event.target;
    let data = new FormData(form);
    data = Object.fromEntries(data);

    try {
      const response = await fetch(`/api/update/category/${data.id}`, {
        headers: { "Content-Type": "application/json" },
        method: "PUT",
        body: JSON.stringify({ Cat: newCatName }),
      });

      if (response.ok) {
        console.log(`Category updated`);
        GetCategory();
        setEditingId(null);
      }
    } catch (error) {
      console.error("category update failed:", error);
    }
  }

  function handleRemove(event) {
    event.preventDefault();
    fetch(event.target.action, {
      method: "DELETE",
    }).then((response) => {
      if (response.ok) {
        GetCategory();
      }
    });
  }

  return (
    <div>
      <form className="form" onSubmit={handleAddSubmit}>
        <h1>Add Category</h1>
        <input
          name="category_name"
          placeholder="Please enter new category name..."
          type="text"
          required
        />
        <input type="submit" value="ADD" />
      </form>

      <p>Existing categories:</p>

      {categories.map((item) => (
        <div className="removeCat" key={item.id}>
          <form
            onSubmit={handleRemove}
            action={`/api/DeleteCategory/${item.id}`}
          >
            <button type="submit" className="RemoveButton">
              -
            </button>
          </form>

          <h3>{item.category_name}</h3>

          <button
            className="editButton"
            onClick={() => showEdit(item.id, item.category_name)}
          >
            ✎
          </button>

          {editingId === item.id && (
            <div className="editForm">
              <form onSubmit={handleCatEditSubmit}>
                <input
                  className="editCategoryForm"
                  name="Cat"
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                />
                <input name="id" type="hidden" value={item.id} />
                <button className="SaveButton" type="submit">
                  &#10003;
                </button>
                <button
                  type="submit"
                  className="RemoveButton"
                  onClick={() => setEditingId(null)}
                >
                  x
                </button>
              </form>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
