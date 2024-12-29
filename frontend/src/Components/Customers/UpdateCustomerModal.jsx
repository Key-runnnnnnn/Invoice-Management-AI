import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from "@mui/material";
import { toast } from "react-hot-toast";
import { useDispatch } from "react-redux";
import { fetchData } from "../../Store/Slice";

const UpdateCustomerModal = ({ data, setUpdateModal }) => {
  const dispatch = useDispatch();
  const [customerUpdates, setCustomerUpdates] = useState({});
  const [updatedInvoices, setUpdatedInvoices] = useState([]);

  useEffect(() => {
    if (data) {
      setCustomerUpdates(data.customers?.[0] || {});
      setUpdatedInvoices(data.invoices || []);
    }
  }, [data]);

  const handleCustomerChange = (e) => {
    const { name, value } = e.target;
    const updatedCustomer = { ...customerUpdates, [name]: value };
    setCustomerUpdates(updatedCustomer);

    if (name === "customerName") {
      syncCustomerNameInInvoices(value);
    }
  };

  const syncCustomerNameInInvoices = (newCustomerName) => {
    const syncedInvoices = updatedInvoices.map((invoice) => ({
      ...invoice,
      customerName: newCustomerName,
    }));
    setUpdatedInvoices(syncedInvoices);
  };

  const handleUpdate = async () => {
    const payload = {
      invoices: updatedInvoices,
      products: data.products,
      customers: [customerUpdates], 
    };

    try {
      const res = await fetch(`/api/data/updatedata/${data._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        throw new Error(errorResponse.message || "Failed to update data.");
      }

      const response = await res.json();
      toast.success(response.msg || "Customer and related invoices updated successfully!");
      dispatch(fetchData());
      setUpdateModal(false);
    } catch (err) {
      toast.error(err.message || "Error updating data.");
      console.error(err);
    }
  };

  return (
    <Dialog open={true} onClose={() => setUpdateModal(false)} fullWidth maxWidth="sm">
      <DialogTitle>Update Customer</DialogTitle>
      <DialogContent>
        <TextField
          label="Customer Name"
          name="customerName"
          value={customerUpdates.customerName || ""}
          onChange={handleCustomerChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Company Name"
          name="companyName"
          value={customerUpdates.companyName || ""}
          onChange={handleCustomerChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Phone Number"
          name="phoneNumber"
          value={customerUpdates.phoneNumber || ""}
          onChange={handleCustomerChange}
          fullWidth
          margin="normal"
        />
        <TextField
          label="Address"
          name="address"
          value={customerUpdates.address || ""}
          onChange={handleCustomerChange}
          fullWidth
          margin="normal"
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setUpdateModal(false)} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleUpdate} color="primary">
          Update
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default UpdateCustomerModal;
