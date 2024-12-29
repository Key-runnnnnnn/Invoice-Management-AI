const Receipt = require("../models/data.model");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const fs = require("fs");
const xlsx = require("xlsx");
const path = require("path");

const genAI = new GoogleGenerativeAI(process.env.API_KEY);
const fileManager = new GoogleAIFileManager(process.env.API_KEY);

const getdata = async (req, res) => {
  try {
    const records = await Receipt.find();

    if (!records || records.length === 0) {
      return res.status(200).json({
        success: true,
        data:[],
        message: "No records found",
      });
    }

    const allData = records.map((record) => ({
      _id: record._id,
      invoices: record.invoices || [],
      products: record.products || [],
      customers: record.customers || [],
    }));

    res.status(200).json({
      success: true,
      data: allData,
    });
  } catch (error) {
    console.error("Error fetching all data:", error.message);
    res.status(500).json({
      success: false,
      message: "An error occurred while fetching records",
      error: error.message,
    });
  }
};


const updatedata = async (req, res) => {
  const { invoices, products, customers } = req.body;
  const { id } = req.params;

  // console.log({ invoices, products, customers });

  try {
    // Validate if all required fields are provided
    if (!invoices || !products || !customers) {
      return res.status(400).json({ msg: "Please enter all fields" });
    }

    // Update the data in the database
    const updateddata = await Receipt.findByIdAndUpdate(
      id,
      { invoices, products, customers },
      { new: true, runValidators: true }
    );

    // If data is not found
    if (!updateddata) {
      return res.status(404).json({ msg: "Data not found" });
    }

    // Respond with the updated data
    res.status(200).json({
      updateddata,  // Return the updated data
      msg: "Data updated successfully"
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Server error" });
  }
};



const deletedata = async (req, res) => {
  try {
    const { id } = req.params;

    // Attempt to delete the record
    const record = await Receipt.findByIdAndDelete(id);

    // Handle case where the record doesn't exist
    if (!record) {
      return res.status(404).json({
        success: false,
        message: "Record not found",
      });
    }

    // Respond with success message
    res.status(200).json({
      success: true,
      message: "Data deleted successfully",
    });
  } catch (error) {
    // Log the error and respond with an error message
    console.error("Error deleting data:", error.message);
    res.status(500).json({
      success: false,
      error: "An internal server error occurred. Please try again later.",
    });
  }
};


const uploadfile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded." });
    }

    const filePath = req.file.path;
    const mimeType = req.file.mimetype;
    const displayName = req.file.originalname;

    // Handle Excel files
    if (
      mimeType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      mimeType === "application/vnd.ms-excel"
    ) {
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0];
      const csvData = xlsx.utils.sheet_to_csv(workbook.Sheets[sheetName]);

      const csvFilePath = `${filePath}.csv`;
      fs.writeFileSync(csvFilePath, csvData, "utf8");

      const uploadResponse = await fileManager.uploadFile(csvFilePath, {
        mimeType: "text/csv",
        displayName: `${displayName}.csv`,
      });

      console.log(
        `Uploaded CSV file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
      );

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      const result = await retryAsync(
        async () =>
          await model.generateContent([
            {
              fileData: {
                fileUri: uploadResponse.file.uri,
                mimeType: "text/csv",
              },
            },
            {
              text: `
  Extract the data from the document and structure it into three sections: 
  
  1. **Invoices**: 
     - For each invoice, extract the following fields:
       - serialNumber (invoice number or unique identifier with each customerName)
       - customerName
       - productNames
       - totalquantity (count of all products)
       - totaltax
       - totalAmount
       - date
     - If extra information is available, include it as well.

  2. **Products**: 
     - For each product, extract the following fields:
       - productname
       - quantity
       - unitPrice
       - tax
       - priceWithTax
     - Optionally include the Discount field if available.

  3. **Customers**: 
     - For each customer, extract the following fields: [there is only one customer in the invoice]
       - customerName: (buyer name or consignee name or party name or customer name) 
       - companyName: (company name or party company name or customer company name)
       - phoneNumber: (buyer phone number or consignee phone number or party phone number or customer phone number)
       - totalAmount: (total amount or total bill amount or total invoice amount)
     - Optionally include any additional details such as email, address, etc.

  Ensure the data is well-structured and formatted as JSON with the appropriate fields for each table.

  If there are multiple customers in the invoice, then combine their products, invoices, and customer details and make an array of objects for each customer so that we can store multiple customers' data in the database.

  If customerName or customerDetails are not available, then you can use "Unknown" as the default value.

  Example 1 structure (Single Invoice and Customer):
  {
    "total": 1,
    "data": [
      {
        "invoices": [
          {
            "serialNumber": "INV-87654",
            "customerName": "Alex Johnson",
            "productNames": ["Product 1", "Product 2", "Product 3"],
            "totalquantity": 4,
            "totaltax": 25.00,
            "totalAmount": 400.00,
            "date": "2024-11-15"
          }
        ],
        "products": [
          {
            "productname": "Product 1",
            "quantity": 1,
            "unitPrice": 100.00,
            "tax": 5.00,
            "priceWithTax": 105.00
          },
          {
            "productname": "Product 2",
            "quantity": 2,
            "unitPrice": 50.00,
            "tax": 5.00,
            "priceWithTax": 55.00
          },
          {
            "productname": "Product 3",
            "quantity": 1,
            "unitPrice": 100.00,
            "tax": 15.00,
            "priceWithTax": 115.00
          }
        ],
        "customers": [
          {
            "customerName": "Alex Johnson",
            "companyName": "AutoWorks",
            "phoneNumber": "555-4321",
            "totalAmount": 400.00
          }
        ]
      }
    ]
  }

  Example 2 structure (Single Invoice and Multiple Customers):
  {
    "total": 2,
    "data": [
      {
        "invoices": [
          {
            "serialNumber": "INV-87654",
            "customerName": "Alex Johnson",
            "productNames": ["Product 1", "Product 2", "Product 3"],
            "totalquantity": 4,
            "totaltax": 25.00,
            "totalAmount": 400.00,
            "date": "2024-11-15"
          }
        ],
        "products": [
          {
            "productname": "Product 1",
            "quantity": 1,
            "unitPrice": 100.00,
            "tax": 5.00,
            "priceWithTax": 105.00
          },
          {
            "productname": "Product 2",
            "quantity": 2,
            "unitPrice": 50.00,
            "tax": 5.00,
            "priceWithTax": 55.00
          },
          {
            "productname": "Product 3",
            "quantity": 1,
            "unitPrice": 100.00,
            "tax": 15.00,
            "priceWithTax": 115.00
          }
        ],
        "customers": [
          {
            "customerName": "Alex Johnson",
            "companyName": "AutoWorks",
            "phoneNumber": "555-4321",
            "totalAmount": 400.00
          }
        ]
      },
      {
        "invoices": [
          {
            "serialNumber": "INV-15236",
            "customerName": "Sarah Lee",
            "productNames": ["Product A", "Product B", "Product C"],
            "totalquantity": 3,
            "totaltax": 15.00,
            "totalAmount": 300.00,
            "date": "2024-11-18"
          }
        ],
        "products": [
          {
            "productname": "Product A",
            "quantity": 1,
            "unitPrice": 100.00,
            "tax": 5.00,
            "priceWithTax": 105.00
          },
          {
            "productname": "Product B",
            "quantity": 2,
            "unitPrice": 50.00,
            "tax": 10.00,
            "priceWithTax": 60.00
          }
        ],
        "customers": [
          {
            "customerName": "Sarah Lee",
            "companyName": "Tech Corp",
            "phoneNumber": "555-1234",
            "totalAmount": 300.00
          }
        ]
      }
    ]
  }
`

,
            },
          ]),
        3,
        2000
      );

      const extractedText = result.response.candidates[0].content.parts[0].text;
      const jsonData = JSON.parse(extractedText.replace(/```json|```/g, ""));
      console.log("Extracted JSON Data:", jsonData);

      if (jsonData.total > 1) {
        for (const customerData of jsonData.data) {
          const receipt = new Receipt({
            invoices: customerData.invoices || [],
            products: customerData.products || [],
            customers: customerData.customers || [],
          });
          await receipt.save();
        }
      } else if (jsonData.total === 1) {
        const fileDataPath = `${filePath}-data.json`;
        fs.writeFileSync(fileDataPath, JSON.stringify(jsonData, null, 2));
        console.log(`Data saved in file: ${fileDataPath}`);
      }

      res.status(200).json({
        message: "Excel file processed and data saved successfully.",
        total: jsonData.total,
        jsonData,
      });

      fs.unlinkSync(filePath);
      fs.unlinkSync(csvFilePath);
      return;
    }

    // Handle PDF/Image files
    const uploadResponse = await fileManager.uploadFile(filePath, {
      mimeType,
      displayName,
    });

    console.log(
      `Uploaded file ${uploadResponse.file.displayName} as: ${uploadResponse.file.uri}`
    );

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await retryAsync(
      async () =>
        await model.generateContent([
          {
            fileData: {
              fileUri: uploadResponse.file.uri,
              mimeType: uploadResponse.file.mimeType,
            },
          },
          {
            text: `
  Extract the data from the document and structure it into three sections: 
  
  1. **Invoices**: 
     - For each invoice, extract the following fields:
       - serialNumber 
       - customerName
       - productNames
       - totalquantity
       - totaltax
       - totalAmount
       - date
     - If extra information is available, include it as well.

  2. **Products**: 
     - For each product, extract the following fields:
       - productname
       - quantity
       - unitPrice
       - tax
       - priceWithTax
     - Optionally include the Discount field if available.

  3. **Customers**: 
     - For each customer, extract the following fields: [there is only one customer in the invoice]
       - customerName: (buyer name or consignee name or party name or customer name) 
       - companyName: (company name or party company name or customer company name)
       - phoneNumber: (buyer phone number or consignee phone number or party phone number or customer phone number)
       - totalAmount: (total amount or total bill amount or total invoice amount)
     - Optionally include any additional details such as email, address, etc.

  Ensure the data is well-structured and formatted as JSON with the appropriate fields for each table.

  If there are multiple customers in the invoice, then combine their products, invoices, and customer details and make an array of objects for each customer so that we can store multiple customers' data in the database.

  If customerName or customerDetails are not available, then you can use "Unknown" as the default value.

  Example 1 structure (Single Invoice and Customer):
  {
    "total": 1,
    "data": [
      {
        "invoices": [
          {
            "serialNumber": "INV-87654",
            "customerName": "Alex Johnson",
            "productNames": ["Product 1", "Product 2", "Product 3"],
            "totalquantity": 4,
            "totaltax": 25.00,
            "totalAmount": 400.00,
            "date": "2024-11-15"
          }
        ],
        "products": [
          {
            "productname": "Product 1",
            "quantity": 1,
            "unitPrice": 100.00,
            "tax": 5.00,
            "priceWithTax": 105.00
          },
          {
            "productname": "Product 2",
            "quantity": 2,
            "unitPrice": 50.00,
            "tax": 5.00,
            "priceWithTax": 55.00
          },
          {
            "productname": "Product 3",
            "quantity": 1,
            "unitPrice": 100.00,
            "tax": 15.00,
            "priceWithTax": 115.00
          }
        ],
        "customers": [
          {
            "customerName": "Alex Johnson",
            "companyName": "AutoWorks",
            "phoneNumber": "555-4321",
            "totalAmount": 400.00
          }
        ]
      }
    ]
  }

  Example 2 structure (Single Invoice and Multiple Customers):
  {
    "total": 2,
    "data": [
      {
        "invoices": [
          {
            "serialNumber": "INV-87654",
            "customerName": "Alex Johnson",
            "productNames": ["Product 1", "Product 2", "Product 3"],
            "totalquantity": 4,
            "totaltax": 25.00,
            "totalAmount": 400.00,
            "date": "2024-11-15"
          }
        ],
        "products": [
          {
            "productname": "Product 1",
            "quantity": 1,
            "unitPrice": 100.00,
            "tax": 5.00,
            "priceWithTax": 105.00
          },
          {
            "productname": "Product 2",
            "quantity": 2,
            "unitPrice": 50.00,
            "tax": 5.00,
            "priceWithTax": 55.00
          },
          {
            "productname": "Product 3",
            "quantity": 1,
            "unitPrice": 100.00,
            "tax": 15.00,
            "priceWithTax": 115.00
          }
        ],
        "customers": [
          {
            "customerName": "Alex Johnson",
            "companyName": "AutoWorks",
            "phoneNumber": "555-4321",
            "totalAmount": 400.00
          }
        ]
      },
      {
        "invoices": [
          {
            "serialNumber": "INV-15236",
            "customerName": "Sarah Lee",
            "productNames": ["Product A", "Product B", "Product C"],
            "totalquantity": 3,
            "totaltax": 15.00,
            "totalAmount": 300.00,
            "date": "2024-11-18"
          }
        ],
        "products": [
          {
            "productname": "Product A",
            "quantity": 1,
            "unitPrice": 100.00,
            "tax": 5.00,
            "priceWithTax": 105.00
          },
          {
            "productname": "Product B",
            "quantity": 2,
            "unitPrice": 50.00,
            "tax": 10.00,
            "priceWithTax": 60.00
          }
        ],
        "customers": [
          {
            "customerName": "Sarah Lee",
            "companyName": "Tech Corp",
            "phoneNumber": "555-1234",
            "totalAmount": 300.00
          }
        ]
      }
    ]
  }
`
,
          },
        ]),
      3,
      2000
    );

    const extractedText = result.response.candidates[0].content.parts[0].text;
    const jsonData = JSON.parse(extractedText.replace(/```json|```/g, ""));
    console.log("Extracted JSON Data:", jsonData);

    if (jsonData.total > 1) {
      for (const customerData of jsonData.data) {
        try {
          const receipt = new Receipt({
            invoices: customerData.invoices || [],
            products: customerData.products || [],
            customers: customerData.customers || [],
          });
          await receipt.save(); // Save to MongoDB
          console.log("Saved receipt data to MongoDB:", receipt);
        } catch (error) {
          console.error("Error saving receipt to MongoDB:", error.message,receipt);
          res.status(500).json({
            error: "Error saving receipt data to MongoDB",
            gemini:jsonData,
          });
          return;
        }
      }
    } else if (jsonData.total === 1) {
      try {
        const customerData = jsonData.data[0];
        const receipt = new Receipt({
          invoices: customerData.invoices || [],
          products: customerData.products || [],
          customers: customerData.customers || [],
        });
        await receipt.save(); // Save to MongoDB
        console.log("Saved single receipt data to MongoDB:", receipt);
      } catch (error) {
        console.error("Error saving single receipt to MongoDB:", error.message);
        res.status(500).json({
          error: "Error saving single receipt data to MongoDB",
        });
        return;
      }
    }
    

    res.status(200).json({
      message: "PDF/Image file processed and data saved successfully.",
      total: jsonData.total,
      jsonData,
    });

    fs.unlinkSync(filePath);
  } catch (error) {
    console.error("Error processing file:", error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Retry logic with exponential backoff
 * @param {Function} fn - The function to retry
 * @param {number} retries - Number of retries
 * @param {number} delay - Initial delay in milliseconds
 */
async function retryAsync(fn, retries, delay) {
  let attempts = 0;

  while (attempts < retries) {
    try {
      return await fn();
    } catch (error) {
      attempts++;
      if (attempts >= retries || error.response?.status !== 503) {
        throw error;
      }
      console.warn(
        `Retry attempt ${attempts} failed. Retrying in ${delay}ms...`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2;
    }
  }
}

module.exports = {
  getdata,
  updatedata,
  deletedata,
  uploadfile,
};
