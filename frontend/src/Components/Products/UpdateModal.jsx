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

const UpdateModal = ({ data, setUpdateModal }) => {
  console.log(data);
  const dispatch = useDispatch();
  const [updatedProducts, setUpdatedProducts] = useState([]);
  const [invoiceUpdates, setInvoiceUpdates] = useState({});
  const [customerUpdates, setCustomerUpdates] = useState({});

  useEffect(() => {
    if (data) {
      setUpdatedProducts(data.products || []);
      setInvoiceUpdates(data.invoices?.[0] || {});
      setCustomerUpdates(data.customers?.[0] || {});
    }
  }, [data]);

  const recalculatePriceWithTax = (product) => {
    const quantity = parseInt(product.quantity || 0, 10);
    const unitPrice = parseFloat(product.unitPrice || 0);
    const tax = parseFloat(product.tax || 0);
    const totalPrice = quantity * unitPrice + tax;
    return totalPrice.toFixed(2); 
  };

  const recalculateFields = (updated) => {
    const productNames = updated.map((p) => p.productname || "Unnamed Product");
    const totalQuantity = updated.reduce(
      (acc, p) => acc + (parseInt(p.quantity, 10) || 0),
      0
    );
    const totalTax = updated.reduce(
      (acc, p) => acc + (parseFloat(p.tax) || 0),
      0
    );
    const totalAmount = updated
      .reduce((acc, p) => acc + (parseFloat(p.priceWithTax) || 0), 0)
      .toFixed(2); 
    setInvoiceUpdates((prev) => ({
      ...prev,
      productNames,
      totalquantity: totalQuantity,
      totaltax: totalTax.toFixed(2), // Ensure 2 decimal places for tax
      totalAmount,
    }));

    setCustomerUpdates((prev) => ({
      ...prev,
      totalAmount,
    }));
  };

  const handleProductChange = (index, field, value) => {
    const updated = [...updatedProducts];
    const product = { ...updated[index], [field]: value };

    if (["quantity", "unitPrice", "tax"].includes(field)) {
      product.priceWithTax = recalculatePriceWithTax(product);
    }

    updated[index] = product;
    setUpdatedProducts(updated);
    recalculateFields(updated);
  };

  const handleUpdate = async () => {
    const payload = {
      invoices: [invoiceUpdates],
      products: updatedProducts,
      customers: [customerUpdates],
    };

    console.log("Payload being sent:", payload);

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
      toast.success(response.message || "Data updated successfully!");
      dispatch(fetchData());
      setUpdateModal(false);
    } catch (err) {
      toast.error(err.message || "Error updating data.");
      console.error(err);
    }
  };

  return (
    <Dialog open={true} onClose={() => setUpdateModal(false)} fullWidth maxWidth="md">
      <DialogTitle>Update Products</DialogTitle>
      <DialogContent>
        {updatedProducts.map((product, index) => (
          <div key={index} className="mb-4 border-b pb-4">
            <h3 className="text-lg font-semibold mb-2">
              Product {index + 1}: {product.productname || "Unnamed Product"}
            </h3>
            <TextField
              label="Product Name"
              value={product.productname || ""}
              onChange={(e) => handleProductChange(index, "productname", e.target.value)}
              fullWidth
              margin="normal"
            />
            <TextField
              label="Quantity"
              value={product.quantity || ""}
              onChange={(e) => handleProductChange(index, "quantity", e.target.value)}
              fullWidth
              margin="normal"
              type="number"
            />
            <TextField
              label="Unit Price"
              value={product.unitPrice || ""}
              onChange={(e) => handleProductChange(index, "unitPrice", e.target.value)}
              fullWidth
              margin="normal"
              type="number"
            />
            <TextField
              label="Tax"
              value={product.tax || ""}
              onChange={(e) => handleProductChange(index, "tax", e.target.value)}
              fullWidth
              margin="normal"
              type="number"
            />
            <TextField
              label="Price with Tax"
              value={product.priceWithTax || ""}
              disabled
              fullWidth
              margin="normal"
            />
          </div>
        ))}
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

export default UpdateModal;
