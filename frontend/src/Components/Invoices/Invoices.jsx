import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Pagination } from "@mui/material";
import { fetchData } from "../../Store/Slice"; // Corrected import

const Invoices = () => {
  const dispatch = useDispatch();
  const { data: invoices, status, error } = useSelector((state) => state.data);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchData());
    }
  }, [dispatch, status]);

  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const allInvoices = invoices.flatMap((item) => item.invoices || []);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedInvoices = allInvoices.slice(startIndex, endIndex);

  if (status === "loading") {
    return <p className="text-gray-500">Loading...</p>;
  }

  if (status === "failed") {
    return <p className="text-red-500">{error}</p>;
  }

  if (!allInvoices.length) {
    return <p className="text-gray-500">No invoices found.</p>;
  }

  return (
    <div className="max-w-7xl mx-auto p-5 bg-slate-50 shadow-md rounded-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Invoices</h2>
      <table className="w-full border-collapse border border-gray-300">
        <thead className="bg-gray-100">
          <tr>
            <th className="border border-gray-300 px-4 py-2">Serial Number</th>
            <th className="border border-gray-300 px-4 py-2">Customer Name</th>
            <th className="border border-gray-300 px-4 py-2">Product Names</th>
            <th className="border border-gray-300 px-4 py-2">Quantity</th>
            <th className="border border-gray-300 px-4 py-2">Tax</th>
            <th className="border border-gray-300 px-4 py-2">Total Amount</th>
            <th className="border border-gray-300 px-4 py-2">Date</th>
          </tr>
        </thead>
        <tbody>
          {paginatedInvoices.map((invoice, index) => (
            <tr key={index} className="hover:bg-gray-100">
              <td className="border border-gray-300 px-4 py-2">
                {invoice.serialNumber || "N/A"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {invoice.customerName || "N/A"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {invoice.productNames?.join(", ") || "N/A"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {invoice.totalquantity || "N/A"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {invoice.totaltax?.toFixed(2) || "N/A"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {invoice.totalAmount || "N/A"}
              </td>
              <td className="border border-gray-300 px-4 py-2">
                {invoice.date
                  ? new Date(invoice.date).toLocaleDateString()
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 flex justify-center">
        <Pagination
          count={Math.ceil(allInvoices.length / itemsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </div>
    </div>
  );
};

export default Invoices;
