import React, { useState, useEffect } from "react";
import FileUpload from "../Components/FileUpload/FileUpload";
import Invoices from "../Components/Invoices/Invoices";
import Products from "../Components/Products/Products";
import Customers from "../Components/Customers/Customers";
import { useDispatch, useSelector } from "react-redux";
import { fetchData } from "../Store/Slice";
import Loading from "../Components/Loading/Loading";

const Home = () => {
  const [activeTab, setActiveTab] = useState("Invoices");

  const dispatch = useDispatch();
  const { data, status, error } = useSelector((state) => state.data);

  useEffect(() => {
    if (status === "idle") {
      dispatch(fetchData());
    }
  }, [status, dispatch]);

  if (status === "loading") return <Loading />;
  if (status === "failed") return <p>Error: {error}</p>;

  const tabs = [
    { id: "Invoices", label: "Invoices" },
    { id: "Products", label: "Products" },
    { id: "Customers", label: "Customers" },
    { id: "UploadReceipt", label: "Upload Receipt" },
  ];

  const getButtonClasses = (tab) =>
    `px-4 py-2 rounded shadow-md ${
      activeTab === tab
        ? "bg-indigo-500 text-white"
        : "text-gray-700 hover:bg-gray-100"
    }`;

  return (
    <div className="p-6">
      <div className="flex flex-wrap items-center justify-center shadow-md gap-4 border-b pb-2 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={getButtonClasses(tab.id)}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-4 rounded shadow">
        {activeTab === "UploadReceipt" && <FileUpload />}
        {activeTab === "Invoices" && <Invoices />}
        {activeTab === "Products" && <Products />}
        {activeTab === "Customers" && <Customers />}
        {!tabs.some((tab) => tab.id === activeTab) && (
          <div className="text-gray-500">Please select a valid tab.</div>
        )}
      </div>
    </div>
  );
};

export default Home;
