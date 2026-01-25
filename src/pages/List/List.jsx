import React, { useEffect, lazy } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./List.css";

const EditFoodModal = lazy(() => import("../../components/EditFoodModal"));
const ConfirmModal = lazy(() => import("../../common/ConfirmModal/ConfirmModal"));

const List = ({ url }) => {
  const [list, setList] = React.useState([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isAddOpen, setIsAddOpen] = React.useState(false); // State for Add Modal
  const [food, setFood] = React.useState(null);

  // Deletion state
  const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
  const [deleteId, setDeleteId] = React.useState(null);
  const [deleteLoading, setDeleteLoading] = React.useState(false);

  // Filter & Pagination State
  const [search, setSearch] = React.useState("");
  const [category, setCategory] = React.useState("All");
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [totalItems, setTotalItems] = React.useState(0);
  const limit = 10;

  // ... (categories array and fetchList function remain same) ...
  const categories = [
    "All",
    "Salad",
    "Rolls",
    "Deserts",
    "Sandwich",
    "Cake",
    "Pure Veg",
    "Pasta",
    "Noodles"
  ];

  const fetchList = async () => {
    let query = `${url}/api/food/list?page=${page}&limit=${limit}`;
    if (search) query += `&search=${search}`;
    if (category && category !== "All") query += `&category=${category}`;

    const res = await axios.get(query);
    if (res.data.success) {
      setList(res.data.data);
      if (res.data.total) {
        setTotalItems(res.data.total);
        setTotalPages(Math.ceil(res.data.total / limit));
      }
    } else {
      toast.error(res.data.message);
    }
  };

  const removeFood = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      const res = await axios.delete(`${url}/api/food/delete?id=${deleteId}`);
      if (res.data.success) {
        toast.success(res.data.message);
        setIsConfirmOpen(false);
        fetchList();
      } else {
        toast.error("Something went wrong");
      }
    } catch (error) {
      toast.error("Error deleting food");
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    fetchList();
  }, [page, category]);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      setPage(1);
      fetchList();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [search]);


  return (
    <>
      <div className="list add flex-col">
        <div className="list-header">
          <div className="list-title-btn">
            <p>All Foods List</p>
            <button className="add-new-btn" onClick={() => setIsAddOpen(true)}>+ Add New Item</button>
          </div>
          <div className="list-controls">
            <input
              type="text"
              placeholder="Search by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input"
            />
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="category-select"
            >
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
        </div>

        <div className="list-table">
          <div className="list-table-format title">
            <b>Image</b>
            <b>Name</b>
            <b>Category</b>
            <b>Price</b>
            <b>Action</b>
          </div>
          {list.length === 0 ? <p className="no-data">No foods found.</p> : list.map((item, index) => {
            return (
              <div className="list-table-format" key={index}>
                <img src={`${url}/images/${item.image}`} alt={item.name} />
                <p>{item.name}</p>
                <p>{item.category}</p>
                <p>${item.price}</p>
                <p>
                  <button
                    onClick={() => {
                      setIsOpen(true);
                      setFood(item);
                    }}
                    className="edit-btn"
                  >
                    Edit
                  </button>
                  <span onClick={() => { setDeleteId(item._id); setIsConfirmOpen(true); }} className="cursor delete-btn">
                    X
                  </span>
                </p>
              </div>
            );
          })}
        </div>

        {/* Pagination Controls */}
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(curr => curr - 1)}>Prev</button>
          <span>Page {page} of {totalPages || 1}</span>
          <button disabled={page >= totalPages} onClick={() => setPage(curr => curr + 1)}>Next</button>
        </div>
      </div>
      {isOpen && (
        <EditFoodModal
          url={url}
          mode="edit"
          onClose={() => setIsOpen(false)}
          open={isOpen}
          food={food}
          onUpdated={fetchList}
        />
      )}
      {isAddOpen && (
        <EditFoodModal
          url={url}
          mode="add"
          open={isAddOpen}
          onClose={() => setIsAddOpen(false)}
          onUpdated={fetchList}
        />
      )}
      {isConfirmOpen && (
        <ConfirmModal
          open={isConfirmOpen}
          onClose={() => setIsConfirmOpen(false)}
          onConfirm={removeFood}
          loading={deleteLoading}
          title="Delete Food Item"
          message={`Are you sure you want to delete this food item? This action cannot be undone.`}
        />
      )}
    </>
  );
};

export default List;
