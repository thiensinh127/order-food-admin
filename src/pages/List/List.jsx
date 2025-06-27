import React, { useEffect } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "./List.css";
const List = ({ url }) => {
  const [list, setList] = React.useState([]);
  const fetchList = async () => {
    const res = await axios.get(`${url}/api/food/list`);
    if (res.data.success) {
      setList(res.data.data);
    } else {
      toast.error(res.data.message);
    }
  };

  const removeFood = async (foodId) => {
    const res = await axios.delete(`${url}/api/food/delete?id=${foodId}`);
    if (res.data.success) {
      toast.success(res.data.message);
      fetchList();
    } else {
      toast.error("Something went wrong");
    }
  };

  useEffect(() => {
    fetchList();
  }, []);

  return (
    <div className="list add flex-col">
      <p>Add Foods List</p>
      <div className="list-table">
        <div className="list-table-format title">
          <b>Image</b>
          <b>Name</b>
          <b>Category</b>
          <b>Price</b>
          <b>Action</b>
        </div>
        {list.map((item, index) => {
          return (
            <div className="list-table-format" key={index}>
              <img src={`${url}/images/${item.image}`} alt={item.name} />
              <p>{item.name}</p>
              <p>{item.category}</p>
              <p>${item.price}</p>
              <p onClick={() => removeFood(item._id)} className="cursor">
                X
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default List;
