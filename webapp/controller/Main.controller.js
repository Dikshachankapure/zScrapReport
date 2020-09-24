sap.ui.define([
	"sap/ui/core/mvc/Controller",
	"sap/m/MessageBox",
	"sap/ui/model/Filter",
	"demo/zscrapreport_json/model/CustomerFormat",
	"demo/zscrapreport_json/model/InitPage",
	"sap/ui/core/Fragment",
	"sap/ui/model/json/JSONModel",
], function (Controller, MessageBox, Filter, CustomerFormat, InitPageUtil, Fragment, JSONModel) {
	"use strict";

	return Controller.extend("demo.zscrapreport_json.controller.Main", {
		onInit: function () {
			this.initCustomFormat();
			var oDate = new Date();

			this.byId("dpPeriodFrom").setDateValue(new Date(oDate.getFullYear(), oDate.getMonth(), 1));
			this.byId("dpPeriodTo").setDateValue(new Date(oDate.getFullYear(), oDate.getMonth() + 1, 0));

			var oVizFrame = this.oVizFrame = this.getView().byId("idVizFrame");
			oVizFrame.setVizProperties({
				plotArea: {
					dataLabel: {
						formatString: CustomerFormat.FIORI_LABEL_SHORTFORMAT_2,
						visible: true
					}
				},
				valueAxis: {
					label: {
						formatString: CustomerFormat.FIORI_LABEL_SHORTFORMAT_10
					},
					title: {
						visible: true
					}
				},
				categoryAxis: {
					title: {
						visible: true
					}
				},
				title: {
					visible: true,
					text: 'Scrap Report'
				}
			});

			InitPageUtil.initPageSettings(this.getView());
			var oPopOver = this.getView().byId("idPopOver");
			oPopOver.connect(oVizFrame.getVizUid());
			oPopOver.setFormatString(CustomerFormat.FIORI_LABEL_FORMAT_2);
		},

		initCustomFormat: function () {
			CustomerFormat.registerCustomFormat();
		},

		fnPlantSearchHelp: function (oEvent) {
			var oModelPlant = this.getOwnerComponent().getModel("PlantSet");

			this.getView().setModel(oModelPlant, "plantModel");

			this.plantinputId = oEvent.getSource().getId();
			if (!this._valueHelpDialogPlant) {
				this._valueHelpDialogPlant = sap.ui.xmlfragment(
					"demo.zscrapreport_json.fragments.Plant",
					this
				);
				this.getView().addDependent(this._valueHelpDialogPlant);

			}

			// open value help dialog filtered by the input value
			this._valueHelpDialogPlant.open();
		},

		fnhandleSearchPlant: function (oEvent) {
			var mValue = oEvent.getParameter("value");
			var oFilter = new Filter("Name1", sap.ui.model.FilterOperator.Contains, mValue);
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter([oFilter]);
		},

		fnCloseDialogPlant: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var mplantInput = this.getView().byId(this.plantinputId);
				mplantInput.setSelectedKey(oSelectedItem.getDescription());
			}
			oEvent.getSource().getBinding("items").filter([]);
		},

		// BEGIN OF COST CENTER GROUP SERACH HELP //	
		fnCCGSearchHelp: function (oEvent) {
			var mPlantID = this.getView().byId("plant");
			if (mPlantID.getSelectedKey().length === 0) {
				MessageBox.error("Enter Plant !");
				return false;
			} else {
				var oModelCCG = this.getOwnerComponent().getModel("CostCenterGroupSet");
				this.getView().setModel(oModelCCG, "CCGModel");
				this.inputIdCCG = oEvent.getSource().getId();
				if (!this._valueHelpDialogCCG) {
					this._valueHelpDialogCCG = sap.ui.xmlfragment(
						"demo.zscrapreport_json.fragments.CostCenterGrp",
						this
					);
					this.getView().addDependent(this._valueHelpDialogCCG);
				}
				// open value help dialog filtered by the input value
				var aFilter = [];
				aFilter.push(new Filter("PlantID", sap.ui.model.FilterOperator.EQ, this.getView().byId("plant").getSelectedKey()));
				sap.ui.getCore().byId("CCGPopup").getBinding("items").filter(aFilter);
				this.getView().byId(this.inputIdCCG).getBinding("suggestionItems").filter(aFilter);
				this._valueHelpDialogCCG.open();
			}
		},

		fnhandleSearchccg: function (oEvent) {
			var sValue = oEvent.getParameter("value");
			var mFilter = [];
			mFilter.push(new Filter("PlantID", sap.ui.model.FilterOperator.EQ, this.getView().byId("plant").getSelectedKey()));
			mFilter.push(new Filter("Description", sap.ui.model.FilterOperator.Contains, sValue));
			var oBinding = oEvent.getSource().getBinding("items");
			oBinding.filter(mFilter);
		},

		fnCloseDialogccg: function (oEvent) {
			var oSelectedItem = oEvent.getParameter("selectedItem");
			if (oSelectedItem) {
				var ccgInput = this.getView().byId(this.inputIdCCG);
				ccgInput.setSelectedKey(oSelectedItem.getDescription());
			}
			oEvent.getSource().getBinding("items").filter([]);
		},
		// END OF COST CENTER GROUP SERACH HELP //

		fnSearch: function () {
			var mPlant = this.getView().byId("plant");
			var mCCGRP = this.getView().byId("CCGRP");
			var mPeriodFrom = this.getView().byId("dpPeriodFrom");
			var mPeriodTo = this.getView().byId("dpPeriodTo");
			
			if(mPlant.getSelectedKey() === ""){
				MessageBox.error("Please Enter Plant");
				return false;
			}
			else if(mCCGRP.getSelectedKey() === ""){
				MessageBox.error("Please Enter Cost Center Group");
				return false;
			}
			else if (mPeriodFrom.getValue().trim().length === 0 || mPeriodTo.getValue().trim().length === 0) {
				MessageBox.error("Posting date is empty !");
				return false;
			} else {
				var oModelScrap = this.getOwnerComponent().getModel("ScrapSet");
				this.getView().setModel(oModelScrap);
			}

		}

	});
});