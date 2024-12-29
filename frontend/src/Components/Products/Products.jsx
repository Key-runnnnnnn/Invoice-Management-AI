import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Pagination } from "@mui/material";
import { fetchData } from "../../Store/Slice"; 
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UpdateModal from "./UpdateModal";
import DeleteModal from "./DeleteModal";

const Products = () => {
  const dispatch = useDispatch();
  const [deleteModal, setDeleteModal] = useState(false);
  const [updateModal, setUpdateModal] = useState(false);
  const [data, setData] = useState({}); 

  const { data: apiData, status, error } = useSelector((state) => state.data);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 2;

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchData()); 
    }
  }, [dispatch, status]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };


  const handleUpdate = (record) => {
    setData(record);
    setUpdateModal(true);
  };

  const handleDelete = (record) => {
    setData(record);
    setDeleteModal(true);
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = apiData.slice(startIndex, startIndex + itemsPerPage);

  if (status === "loading") {
    return <p className="text-gray-500">Loading products...</p>;
  }

  if (status === "failed") {
    return <p className="text-red-500">{error}</p>;
  }

  if (!apiData.length) {
    return <p className="text-gray-500">No products found.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-slate-50 shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Products</h2>
      {paginatedData.map((record) => (
        <div key={record._id} className="mb-6">
          <div className="flex justify-between">
            <h3 className="text-xl font-semibold text-gray-700">
              Record ID: {record._id}
            </h3>
            <div className="flex space-x-4">
              <button
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                onClick={() => handleUpdate(record)}
              >
                <EditIcon /> Edit
              </button>
              <button
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => handleDelete(record)}
              >
                <DeleteIcon /> Delete
              </button>
            </div>
          </div>

          <table className="w-full border-collapse border border-gray-300 mt-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2">Name</th>
                <th className="border border-gray-300 px-4 py-2">Quantity</th>
                <th className="border border-gray-300 px-4 py-2">Unit Price</th>
                <th className="border border-gray-300 px-4 py-2">Tax</th>
                <th className="border border-gray-300 px-4 py-2">
                  Price With Tax
                </th>
              </tr>
            </thead>
            <tbody>
              {record.products.map((product, idx) => (
                <tr key={idx} className="hover:bg-gray-100">
                  <td className="border border-gray-300 px-4 py-2">
                    {product.productname || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {product.quantity || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {product.unitPrice?.toFixed(2) || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {product.tax?.toFixed(2) || "N/A"}
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    {product.priceWithTax?.toFixed(2) || "N/A"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}

      <div className="mt-4 flex justify-center">
        <Pagination
          count={Math.ceil(apiData.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </div>

      {updateModal && (
        <UpdateModal data={data} setUpdateModal={setUpdateModal} />
      )}
      {deleteModal && (
        <DeleteModal data={data} setDeleteModal={setDeleteModal} />
      )}
    </div>
  );
};

export default Products;
