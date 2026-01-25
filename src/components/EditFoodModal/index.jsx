import React from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { Modal } from "../../common/Modal"; // Modal đã dùng CSS thuần
import "./index.css";

/**
 * EditFoodModal — uses the reusable <Modal />
 * Props:
 *  - open: boolean
 *  - onClose: () => void
 *  - food: {_id, name, description, category, price, image}
 *  - url: string (API base URL)
 *  - onUpdated?: () => void (refresh list)
 */
export default function FoodModal({ mode = "edit", open, onClose, food, url, onUpdated }) {
  const [loading, setLoading] = React.useState(false);
  const [imageFile, setImageFile] = React.useState(null);
  const [preview, setPreview] = React.useState("");
  const [form, setForm] = React.useState({
    name: "",
    description: "",
    category: "Salad",
    price: "",
  });

  const isAdd = mode === "add";

  React.useEffect(() => {
    if (!open) return;
    
    if (isAdd) {
      setForm({
        name: "",
        description: "",
        category: "Salad",
        price: "",
      });
      setImageFile(null);
      setPreview("");
    } else if (food) {
      setForm({
        name: food.name ?? "",
        description: food.description ?? "",
        category: food.category ?? "Salad",
        price: String(food.price ?? ""),
      });
      setImageFile(null);
      setPreview(food?.image ? `${url}/images/${food.image}` : "");
    }
  }, [open, food, url, isAdd]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
  }

  function onImageChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    setPreview(URL.createObjectURL(file));
  }

  async function onSubmit(e) {
    e.preventDefault();
    if (!isAdd && !food?._id) return;
    setLoading(true);

    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("category", form.category);
      fd.append("price", String(Number(form.price)));
      if (imageFile) fd.append("image", imageFile);

      let res;
      if (isAdd) {
        res = await axios.post(`${url}/api/food/add`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        res = await axios.patch(`${url}/api/food/update`, fd, {
          params: { id: food._id },
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      if (res.data?.success) {
        toast.success(res.data.message || `Food ${isAdd ? "added" : "updated"}`);
        onUpdated?.();
        onClose?.();
      } else {
        toast.error(res.data?.message || "Operation failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={loading ? undefined : onClose}
      title={isAdd ? "Add new food" : "Edit food"}
      description={isAdd ? "Create a new product listing" : "Update product information"}
      size="md"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="btn-ghost"
          >
            Cancel
          </button>
          <button
            form="food-form"
            type="submit"
            disabled={loading}
            className="btn-primary"
          >
            {loading ? (isAdd ? "Adding..." : "Saving...") : (isAdd ? "Add Item" : "Save changes")}
          </button>
        </>
      }
    >
      <form id="food-form" onSubmit={onSubmit} className="efm-form">
        {/* Image */}
        <div className="efm-field">
          <label className="efm-label">Upload Image</label>
          <div className="efm-img-row">
            <label htmlFor="image" className="efm-img-label">
              <div className={`efm-img-container ${!preview ? 'empty' : ''}`}>
                {preview ? (
                   <img src={preview} alt="preview" className="efm-img" />
                ) : (
                   <div className="upload-placeholder">+</div>
                )}
              </div>
            </label>
            <div>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={onImageChange}
                required={isAdd}
                style={{ display: 'none' }}
              />
              <p className="efm-hint">
                {isAdd ? "Product image is required" : "Choose a new image to replace the current one (optional)"}
              </p>
            </div>
          </div>
        </div>

        {/* Name */}
        <div className="efm-field">
          <label className="efm-label">Product name</label>
          <input
            name="name"
            value={form.name}
            onChange={onChange}
            required
            className="efm-input"
            placeholder="Type here"
          />
        </div>

        {/* Description */}
        <div className="efm-field">
          <label className="efm-label">Product description</label>
          <textarea
            name="description"
            rows={5}
            value={form.description}
            onChange={onChange}
            className="efm-textarea"
            placeholder="Write content here"
          />
        </div>

        {/* Category + Price */}
        <div className="efm-grid">
          <div className="efm-field">
            <label className="efm-label">Product Category</label>
            <select
              name="category"
              value={form.category}
              onChange={onChange}
              className="efm-select"
            >
              <option value="Salad">Salad</option>
              <option value="Rolls">Rolls</option>
              <option value="Deserts">Deserts</option>
              <option value="Sandwich">Sandwich</option>
              <option value="Cake">Cake</option>
              <option value="Pure Veg">Pure Veg</option>
              <option value="Pasta">Pasta</option>
              <option value="Noodles">Noodles</option>
            </select>
          </div>

          <div className="efm-field">
            <label className="efm-label">Product Price</label>
            <input
              name="price"
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={onChange}
              className="efm-input"
              placeholder="$20"
              required
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
