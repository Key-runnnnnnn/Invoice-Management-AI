import React from "react";
import { useDispatch } from "react-redux";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { toast } from "react-hot-toast";
import { fetchData } from "../../Store/Slice"; // Import the fetchData action

const DeleteModal = ({ data, setDeleteModal }) => {
  console.log(data);
  const dispatch = useDispatch();

  const handleDelete = async () => {
    try {
      // Perform DELETE request
      const res = await fetch(`/api/data/deletedata/${data._id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        const errorResponse = await res.json();
        throw new Error(errorResponse.message || "Failed to delete product.");
      }

      const response = await res.json();
      toast.success(response.message || "Product deleted successfully!");

      dispatch(fetchData());

      setDeleteModal(false);
    } catch (err) {
      toast.error(err.message || "Error deleting product.");
      console.error("Error deleting product:", err);
    }
  };

  return (
    <Dialog open={true} onClose={() => setDeleteModal(false)} fullWidth maxWidth="xs">
      <DialogTitle>Delete Product</DialogTitle>
      <DialogContent>
        Are you sure you want to delete this product? This action cannot be undone.
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteModal(false)} color="secondary">
          Cancel
        </Button>
        <Button onClick={handleDelete} color="error">
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteModal;
