sap.ui.define([
		"zjblessons/WorklistEventBus/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"zjblessons/WorklistEventBus/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
		"use strict";

		return BaseController.extend("zjblessons.WorklistEventBus.controller.Worklist", {

			formatter: formatter,

			onInit : function () {
				var oViewModel,
					iOriginalBusyDelay,
					oTable = this.byId("list");

				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
				
				this._aTableSearchState = [];

				oViewModel = new JSONModel({
					worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
					tableNoDataText : this.getResourceBundle().getText("tableNoDataText"),
					tableBusyDelay : 0
				});
				this.setModel(oViewModel, "worklistView");

				oTable.attachEventOnce("updateFinished", function(){
					oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				});
			},

			onUpdateFinished : function (oEvent) {
				var sTitle,
					oTable = oEvent.getSource(),
					iTotalItems = oEvent.getParameter("total");

				if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
				} else {
					sTitle = this.getResourceBundle().getText("worklistTableTitle");
				}
				this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
			},

			onNavBack : function() {
				history.go(-1);
			},


			onSearch : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					this.onRefresh();
				} else {
					var aTableSearchState = [];
					var sQuery = oEvent.getParameter("query");

					if (sQuery && sQuery.length > 0) {
						aTableSearchState = [new Filter("MaterialText", FilterOperator.Contains, sQuery)];
					}
					this._applySearch(aTableSearchState);
				}

			},

			onRefresh : function () {
				var oTable = this.byId("table");
				oTable.getBinding("items").refresh();
			},

			_applySearch: function(aTableSearchState) {
				var oTable = this.byId("table"),
					oViewModel = this.getModel("worklistView");
				oTable.getBinding("items").filter(aTableSearchState, "Application");
				
				if (aTableSearchState.length !== 0) {
					oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
				}
			},

			onSelectionChange: function (oEvent) {
				this.oData = oEvent.getSource().getSelectedContexts()[0].getProperty();
				this._showObject(this.oData.MaterialID);
				this._publishData(this.oData);
			},

			_publishData: function (oData) {
				const eventBus = this.getOwnerComponent().getEventBus();

				setTimeout(() => {
					eventBus.publish("channelA", "orderSelected",{
						oData
					})
				}, sap.ui.getCore().byId("WorklistEventBus---object") ? 0 : 1000);
			},
			

			_showObject : function (MaterialID) {
				this.getRouter().navTo("object", {
					objectId: MaterialID
				});
			},

		});
	}
);