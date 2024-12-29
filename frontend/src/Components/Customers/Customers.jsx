import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Pagination } from "@mui/material";
import { fetchData } from "../../Store/Slice";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import UpdateCustomerModal from "./UpdateCustomerModal";
import DeleteModal from "./DeleteModal";

const Customers = () => {
  const dispatch = useDispatch();

  const { data, status, error } = useSelector((state) => state.data);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const [updateModal, setUpdateModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null); 
  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchData());
    }
  }, [dispatch, status]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const allCustomers = data.flatMap((record) =>
    record.customers.map((customer) => ({
      ...customer,
      record,
    }))
  );


  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedCustomers = allCustomers.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  const handleEditCustomer = (customer) => {
    setSelectedRecord(customer.record);
    setUpdateModal(true);
  };

  const handleDeleteCustomer = (customer) => {
    setSelectedRecord(customer.record);
    setDeleteModal(true);
  };

  if (status === "loading") {
    return <p className="text-gray-500">Loading customers...</p>;
  }

  if (status === "failed") {
    return <p className="text-red-500">{error}</p>;
  }

  if (!allCustomers.length) {
    return <p className="text-gray-500">No customers found.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 bg-slate-50 shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Customers</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2">Customer Name</th>
            <th className="border border-gray-300 px-4 py-2">Company Name</th>
            <th className="border border-gray-300 px-4 py-2">Phone Number</th>
            <th className="border border-gray-300 px-4 py-2">Total Amount</th>
            <th className="border border-gray-300 px-4 py-2">Address</th>
            <th className="border border-gray-300 px-4 py-2">Edit</th>
            <th className="border border-gray-300 px-4 py-2">Delete</th>
          </tr>
        </thead>
        <tbody>
          {paginatedCustomers.map((customer, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">
                {customer.customerName || "Unknown"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {customer.companyName || "Unknown"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {customer.phoneNumber || "N/A"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {customer.totalAmount?.toFixed(2) || "0.00"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {customer.address || "N/A"}
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <button
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                  onClick={() => handleEditCustomer(customer)}
                >
                  <EditIcon />
                </button>
              </td>
              <td className="border border-gray-300 px-4 py-2 text-center">
                <button
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                  onClick={() => handleDeleteCustomer(customer)}
                >
                  <DeleteIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-center">
        <Pagination
          count={Math.ceil(allCustomers.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </div>

      {updateModal && (
        <UpdateCustomerModal
          data={selectedRecord}
          setUpdateModal={setUpdateModal}
        />
      )}

      {deleteModal && (
        <DeleteModal
          data={selectedRecord}
          setDeleteModal={setDeleteModal}
        />
      )}
    </div>
  );
};

export default Customers;
