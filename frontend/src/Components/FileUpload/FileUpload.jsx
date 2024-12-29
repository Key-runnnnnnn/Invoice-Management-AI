import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { toast } from "react-hot-toast";
import { fetchData } from "../../Store/Slice"; 

const FileUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const dispatch = useDispatch();

  const handleFileUpload = async (file) => {
    if (!file) {
      toast.error("No file selected");
      return;
    }

    setIsLoading(true);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/data/uploadfile", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorMessage = await response.json();
        throw new Error(errorMessage.error || "Upload failed");
      }

      const data = await response.json();
      toast.success(data.message || "File uploaded successfully!");

      dispatch(fetchData());
    } catch (error) {
      console.error("Error processing the document:", error);
      toast.error(error.message || "An error occurred during file upload.");
    } finally {
      setIsLoading(false);
      setIsDragging(false);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      handleFileUpload(file);
    } else {
      toast.error("No file detected in drop zone.");
    }
  };

  const handleInputChange = (event) => {
    const file = event.target.files[0];
    handleFileUpload(file);
  };

  return (
    <div
      className={`border-dashed border-2 p-6 rounded-lg text-center transition ${
        isDragging ? "border-indigo-500 bg-indigo-50" : "border-gray-300 bg-white"
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <p className="mb-4 text-gray-600">
        Drag and drop a file here or click the button below to upload.
      </p>
      <input
        type="file"
        id="file-upload"
        className="hidden"
        onChange={handleInputChange}
        accept=".pdf,.txt,.xlsx,.docx,image/jpeg,image/png,image/webp"
      />
      <label
        htmlFor="file-upload"
        className={`cursor-pointer bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600 ${
          isLoading ? "opacity-50 cursor-not-allowed" : ""
        }`}
      >
        {isLoading ? "Uploading..." : "Upload File"}
      </label>
    </div>
  );
};

export default FileUpload;
