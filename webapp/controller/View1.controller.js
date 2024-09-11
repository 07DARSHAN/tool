sap.ui.define([
    "sap/ui/Device",
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel"
], function (Device, Controller, JSONModel) {
    "use strict";

    return Controller.extend("customerportal.controller.View1", {
        onInit: function () {
            var oModel = new JSONModel(sap.ui.require.toUrl("customerportal/model/data.json"));
            this.getView().setModel(oModel);

            var oData = oModel.getData();
            if (!oData.newRecord) {
                oData.newRecord = {
                    Product: "",
                    CreatedDate: new Date().toISOString().split('T')[0]
                };
                oModel.setData(oData);
            }
        },

        onItemSelect: function (oEvent) {
            var item = oEvent.getParameter("item");
            var key = item.getKey(); // You can use this key to identify the selected item
            // Perform actions based on the selected item
            this.byId("pageContainer").to(this.getView().createId(key));
        },
        
        
        onCreate: function () {
            // Open a dialog for adding a new record
            if (!this._oDialog) {
                this._oDialog = sap.ui.xmlfragment("customerportal.Fragments.create", this);
                this.getView().addDependent(this._oDialog);
            }

            // Create a new instance of the new record object
            var oModel = this.getView().getModel();
            var oNewRecord = oModel.getProperty("/newRecord");
            oModel.setProperty("/newRecord", { Product: "", Created: "" }); // Reset new record
            this._oDialog.setModel(new JSONModel(oNewRecord), "newRecord"); // Set new instance as model for the dialog
            this._oDialog.open();
        },
    // sam
        onSave: function () {
            // Close the dialog after saving the new record
            this._oDialog.close();

            // Add saving logic here, update the model with the new record
            var oModel = this.getView().getModel();
            var oData = oModel.getProperty("/newRecord"); // Get the new record from the dialog
            var oProducts = oModel.getProperty("/products"); // Get the products array

            if (!oProducts) {
                oProducts = []; // Initialize it if it doesn't exist
            }

            // Generate serial number (S.No)
            var sNo = oProducts.length + 1;
            oData.SNo = sNo;

            // Generate and set the created date to the current date
            var currentDate = new Date();
            oData.CreatedDate = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

            oProducts.push(oData); // Add the new record to the products array
            oModel.setProperty("/products", oProducts); // Update the model data

            // Update the table in the "Product" scroll container
            var oProductTable = this.byId("productTable");
            oProductTable.getBinding("items").refresh();
        },

        onCancel: function () {
            // Close the dialog without saving
            this._oDialog.close();
        },
        onEdit: function () {
            // Get the selected item from the table
            var oProductTable = this.byId("productTable");
            var aSelectedItems = oProductTable.getSelectedItems();

            // Ensure only one item is selected for editing
            if (aSelectedItems.length !== 1) {
                // Display a message to select a record first
                sap.m.MessageBox.error("Please select a record to edit.", {
                    title: "Error"
                });
                return;
            }

            // Get the selected item's data
            var oSelectedItem = aSelectedItems[0];
            var oSelectedContext = oSelectedItem.getBindingContext();
            var oSelectedProduct = oSelectedContext.getObject();

            // Open the edit dialog
            if (!this._oEditDialog) {
                this._oEditDialog = sap.ui.xmlfragment("customerportal.Fragments.edit", this);
                this.getView().addDependent(this._oEditDialog);
            }

            // Set the selected product as the edit model
            var oEditModel = new JSONModel(oSelectedProduct);
            this._oEditDialog.setModel(oEditModel, "editRecord"); // Set selected record as edit model
            this._oEditDialog.open();
        },
        
        onSaveEdit: function () {
            // Save the edited record
            var oEditModel = this._oEditDialog.getModel("editRecord");
            var oEditedRecord = oEditModel.getData();

            // Get the index of the edited record in the products array
            var oProductTable = this.byId("productTable");
            var oBindingContext = oProductTable.getSelectedItem().getBindingContext();
            var sPath = oBindingContext.getPath();
            var iIndex = parseInt(sPath.split("/")[sPath.split("/").length - 1]);

            // Update the record in the products array
            var oModel = this.getView().getModel();
            var aProducts = oModel.getProperty("/products");
            aProducts[iIndex] = oEditedRecord;
            oModel.setProperty("/products", aProducts);

            // Close the edit dialog
            this._oEditDialog.close();
        },

        onCancelEdit: function () {
            // Close the edit dialog without saving changes
            this._oEditDialog.close();
        },
        onDelete: function () {
            var oProductTable = this.byId("productTable");
            var aSelectedItems = oProductTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                // If no item is selected, show an error message
                sap.m.MessageBox.error("Please select at least one record to delete.", {
                    title: "Error"
                });
                return;
            }

            var oModel = this.getView().getModel();
            var oData = oModel.getData().products; // Assuming products are stored under 'products' property

            // Create an array to store the indices of selected items to delete
            var aIndicesToDelete = [];

            // Loop through the selected items to collect their indices
            aSelectedItems.forEach(function (oSelectedItem) {
                var sPath = oSelectedItem.getBindingContext().getPath();
                var iIndex = parseInt(sPath.split("/")[sPath.split("/").length - 1]);
                aIndicesToDelete.push(iIndex);
            });

            // Sort indices in descending order to delete items from the end of the array first
            aIndicesToDelete.sort(function (a, b) {
                return b - a;
            });

            // Remove selected items from the data array
            aIndicesToDelete.forEach(function (iIndex) {
                oData.splice(iIndex, 1);
            });

            // Update the model data
            oModel.setProperty("/products", oData);

            // Clear selection after deletion
            oProductTable.removeSelections();
        },
        Createon: function () {
            // Open a dialog for adding a new project
            if (!this._oCreateProjectDialog) {
                this._oCreateProjectDialog = sap.ui.xmlfragment("customerportal.Fragments.oncreate", this);
                this.getView().addDependent(this._oCreateProjectDialog);
            }
        
            // Create a new instance of the new project object
            var oModel = this.getView().getModel();
            var oNewProjectRecord = {
                Project: "",
                Product: "", // Set default product value here
                Category: ""
            };
        
            // Set default product value (for example, the first product in the list)
            var aProducts = oModel.getProperty("/products");
            if (aProducts && aProducts.length > 0) {
                oNewProjectRecord.Product = aProducts[0].Product;
            }
        
            oModel.setProperty("/newProjectRecord", oNewProjectRecord); // Reset new project record
            this._oCreateProjectDialog.setModel(new sap.ui.model.json.JSONModel(oNewProjectRecord), "newProjectRecord"); // Set new instance as model for the dialog
            this._oCreateProjectDialog.open();
        },
        
        onSaveProject: function () {
            // Close the dialog after saving the new project
            this._oCreateProjectDialog.close();

            // Add saving logic here, update the model with the new project
            var oModel = this.getView().getModel();
            var oNewProjectRecord = oModel.getProperty("/newProjectRecord"); // Get the new project from the dialog
            var oProjects = oModel.getProperty("/projects") || []; // Get the projects array

            // Ensure oNewProjectRecord is properly initialized
            if (!oNewProjectRecord) {
                oNewProjectRecord = {};
            }

            // Check if the project table is empty
            var isProjectTableEmpty = oProjects.length === 0;

            // If the project table is empty and the new project record is also empty, do not save it
            if (isProjectTableEmpty && Object.values(oNewProjectRecord).every(val => val === "")) {
                // Optionally, you can display a message to inform the user that the record is empty
                return;
            }

            // Find the maximum serial number in the existing projects
            var maxSNo = 0;
            oProjects.forEach(function (project) {
                if (project.SNo > maxSNo) {
                    maxSNo = project.SNo;
                }
            });

            // Increment the maximum serial number to get the next available serial number
            var nextSNo = maxSNo + 1;

            // Set the serial number of the new project
            oNewProjectRecord.SNo = nextSNo;

            // Generate and set the created date to the current date
            var currentDate = new Date();
            oNewProjectRecord.CreatedDate = currentDate.toISOString().split('T')[0]; // Format: YYYY-MM-DD

            // Add the new project to the projects array
            oProjects.push(oNewProjectRecord);
            oModel.setProperty("/projects", oProjects); // Update the model data

            // Clear the new project record for the next entry
            var oNewProjectRecordEmpty = {
                Project: "",
                Product: "",
                Category: ""
            };
            oModel.setProperty("/newProjectRecord", oNewProjectRecordEmpty);

            // Refresh the binding of the table to reflect the changes
            var oProjectTable = this.byId("projectTable");
            oProjectTable.getBinding("items").refresh();
        },

        onCancelProject: function () {
            // Close the create project dialog without saving
            this._oCreateProjectDialog.close();
        },

        Editon: function () {
            // Get the selected item from the project table
            var oProjectTable = this.byId("projectTable");
            var aSelectedItems = oProjectTable.getSelectedItems();

            // Ensure only one item is selected for editing
            if (aSelectedItems.length !== 1) {
                // Display a message to select a record first
                sap.m.MessageBox.error("Please select a record to edit.", {
                    title: "Error"
                });
                return;
            }

            // Get the selected item's data
            var oSelectedItem = aSelectedItems[0];
            var oSelectedContext = oSelectedItem.getBindingContext();
            var oSelectedProject = oSelectedContext.getObject();

            // Open the edit project dialog
            if (!this._oEditProjectDialog) {
                this._oEditProjectDialog = sap.ui.xmlfragment("customerportal.Fragments.onedit", this);
                this.getView().addDependent(this._oEditProjectDialog);
            }

            // Set the selected project as the edit model
            var oEditProjectModel = new JSONModel(oSelectedProject);
            this._oEditProjectDialog.setModel(oEditProjectModel, "editProjectRecord"); // Set selected record as edit model
            this._oEditProjectDialog.open();
        },

        onSaveEditProject: function () {
            // Save the edited project
            var oEditProjectModel = this._oEditProjectDialog.getModel("editProjectRecord");
            var oEditedProjectRecord = oEditProjectModel.getData();

            // Get the index of the edited project in the projects array
            var oProjectTable = this.byId("projectTable");
            var oBindingContext = oProjectTable.getSelectedItem().getBindingContext();
            var sPath = oBindingContext.getPath();
            var iIndex = parseInt(sPath.split("/")[sPath.split("/").length - 1]);

            // Update the project in the projects array
            var oModel = this.getView().getModel();
            var aProjects = oModel.getProperty("/projects");
            aProjects[iIndex] = oEditedProjectRecord;
            oModel.setProperty("/projects", aProjects);

            // Close the edit project dialog
            this._oEditProjectDialog.close();
        },

        onCancelEditProject: function () {
            // Close the edit project dialog without saving changes
            this._oEditProjectDialog.close();
        },

        Deleteon: function () {
            var oProjectTable = this.byId("projectTable");
            var aSelectedItems = oProjectTable.getSelectedItems();

            if (aSelectedItems.length === 0) {
                // If no item is selected, show an error message
                sap.m.MessageBox.error("Please select at least one record to delete.", {
                    title: "Error"
                });
                return;
            }

            var oModel = this.getView().getModel();
            var oData = oModel.getData().projects; // Assuming projects are stored under 'projects' property

            // Create an array to store the indices of selected items to delete
            var aIndicesToDelete = [];

            // Loop through the selected items to collect their indices
            aSelectedItems.forEach(function (oSelectedItem) {
                var sPath = oSelectedItem.getBindingContext().getPath();
                var iIndex = parseInt(sPath.split("/")[sPath.split("/").length - 1]);
                aIndicesToDelete.push(iIndex);
            });

            // Sort indices in descending order to delete items from the end of the array first
            aIndicesToDelete.sort(function (a, b) {
                return b - a;
            });

            // Remove selected items from the data array
            aIndicesToDelete.forEach(function (iIndex) {
                oData.splice(iIndex, 1);
            });

            // Update the model data
            oModel.setProperty("/projects", oData);

            // Clear selection after deletion
            // Clear selection after deletion
            oProjectTable.removeSelections();
        },
   // Ensure that fragment IDs match the actual IDs of the XML fragments
   
onCreatePress: function () {
    // Open a dialog for adding a new entry
    if (!this._oCreateEntryDialog) {
        this._oCreateEntryDialog = sap.ui.xmlfragment("customerportal.Fragments.rcreate", this);
        this.getView().addDependent(this._oCreateEntryDialog);
    }
    this._oCreateEntryDialog.open();
},

// onEditPress: function () {
//     var oTable = this.byId("categoryTable");
//     var aSelectedItems = oTable.getSelectedItems();

//     if (aSelectedItems.length === 0) {
//         // If no item is selected, show an error message
//         sap.m.MessageBox.error("Please select a record to edit.", {
//             title: "Error"
//         });
//         return;
//     }

//     // Open the edit entry dialog
//     if (!this._oEditEntryDialog) {
//         this._oEditEntryDialog = sap.ui.xmlfragment("customerportal.Fragments.redit", this);
//         this.getView().addDependent(this._oEditEntryDialog);
//     }

//     // Set the selected entry context as the edit model
//     var oSelectedItem = aSelectedItems[0];
//     var oSelectedContext = oSelectedItem.getBindingContext();
//     var oSelectedEntry = oSelectedContext.getObject();
//     var oEditEntryModel = new sap.ui.model.json.JSONModel(oSelectedEntry);
//     this._oEditEntryDialog.setModel(oEditEntryModel, "editEntry");
//     this._oEditEntryDialog.open();
// },

onDeletePress: function () {
    var oTable = this.byId("categoryTable");
    var aSelectedItems = oTable.getSelectedItems();

    if (aSelectedItems.length === 0) {
        // If no item is selected, show an error message
        sap.m.MessageBox.error("Please select at least one record to delete.", {
            title: "Error"
        });
        return;
    }

    var oModel = this.getView().getModel();
    var oData = oModel.getProperty("/selectedEntry");

    // Create an array to store the indices of selected items to delete
    var aIndicesToDelete = [];

    // Loop through the selected items to collect their indices
    aSelectedItems.forEach(function (oSelectedItem) {
        var sPath = oSelectedItem.getBindingContext().getPath();
        var iIndex = parseInt(sPath.split("/")[sPath.split("/").length - 1]);
        aIndicesToDelete.push(iIndex);
    });

    // Sort indices in descending order to delete items from the end of the array first
    aIndicesToDelete.sort(function (a, b) {
        return b - a;
    });

    // Remove selected items from the data array
    aIndicesToDelete.forEach(function (iIndex) {
        oData.splice(iIndex, 1);
    });

    // Update the model data
    oModel.setProperty("/selectedEntry", oData);

    // Clear selection after deletion
    oTable.removeSelections();
},


onSaveEntry: function () {
    var oModel = this.getView().getModel();
    
    // Generate Serial Number
    var aSelectedEntry = oModel.getProperty("/selectedEntry");
    var iSerialNumber = aSelectedEntry.length + 1; // Assuming S.No starts from 1 and increments
    
    // Generate Created Date in "yyyy-mm-dd" format
    var currentDate = new Date();
    var sCreatedDate = currentDate.getFullYear() + '-' + ('0' + (currentDate.getMonth() + 1)).slice(-2) + '-' + ('0' + currentDate.getDate()).slice(-2);

    // Create new entry with generated S.No and Created Date
    var oNewEntry = {
        SNo: iSerialNumber,
        Product: sap.ui.getCore().byId("createEntryProjectDropdown").getSelectedItem().getKey(),
        Project: sap.ui.getCore().byId("createEntryProjectDropdown").getSelectedItem().getKey(),
        Category: sap.ui.getCore().byId("category").getValue(),
        Customer: sap.ui.getCore().byId("customer").getValue(),
        CreatedDate: sCreatedDate
    };

    // Add the new entry to the model
    aSelectedEntry.push(oNewEntry);
    oModel.setProperty("/selectedEntry", aSelectedEntry);

    // Clear input fields and dropdowns
    sap.ui.getCore().byId("createEntryProductDropdown").setSelectedKey("");
    sap.ui.getCore().byId("createEntryProjectDropdown").setSelectedKey("");
    sap.ui.getCore().byId("category").setValue("");
    sap.ui.getCore().byId("customer").setValue("");

    // Close the dialog after saving
    if (this._oCreateEntryDialog) {
        this._oCreateEntryDialog.close();
    }

    // Refresh table binding to reflect the changes
    var oTable = this.getView().byId("categoryTable");
    oTable.getBinding("items").refresh();
},

onEditPress: function () {
    var oTable = this.byId("categoryTable");
    var aSelectedItems = oTable.getSelectedItems();
    if (aSelectedItems.length !== 1) {
        sap.m.MessageToast.show("Please select a record to edit.");
        return;
    }
    var oSelectedItem = aSelectedItems[0];
    var oBindingContext = oSelectedItem.getBindingContext();
    var oSelectedEntryRecord = oBindingContext.getObject();

    if (!this._oEditEntryDialog) {
        this._oEditEntryDialog = sap.ui.xmlfragment(this.getView().getId(), "customerportal.Fragments.redit", this);
        this.getView().addDependent(this._oEditEntryDialog);
    }

    var oEditEntryModel = new sap.ui.model.json.JSONModel(oSelectedEntryRecord);
    this._oEditEntryDialog.setModel(oEditEntryModel, "editEntryRecord");

    this._oEditEntryDialog.open();
},

onCustomEditSavePress: function () {
    var oEditEntryModel = this._oEditEntryDialog.getModel("editEntryRecord");
    if (!oEditEntryModel) {
        return;
    }
    var oEditedEntryRecord = oEditEntryModel.getData();

    var oTable = this.byId("categoryTable");
    var oBindingContext = oTable.getSelectedItem().getBindingContext();
    var sPath = oBindingContext.getPath();
    var iIndex = parseInt(sPath.split("/")[sPath.split("/").length - 1]);

    var oModel = this.getView().getModel();
    var aSelectedEntry = oModel.getProperty("/selectedEntry");
    aSelectedEntry[iIndex] = oEditedEntryRecord;
    oModel.setProperty("/selectedEntry", aSelectedEntry);

    this._oEditEntryDialog.close();
},

onCustomEditCancelPress: function () {
    if (this._oEditEntryDialog) {
        this._oEditEntryDialog.close();
    }
}


    });
});
