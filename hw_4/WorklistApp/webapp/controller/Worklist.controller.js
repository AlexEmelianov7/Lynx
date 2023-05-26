sap.ui.define([
		"zjblessons/WorklistApp/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"zjblessons/WorklistApp/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/core/Fragment",
		"sap/m/MessageBox"
	], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Fragment, MessageBox) {
		"use strict";

		return BaseController.extend("zjblessons.WorklistApp.controller.Worklist", {

			formatter: formatter,

			onInit : function () {
				var oViewModel,
					iOriginalBusyDelay,
					oTable = this.byId("table");

				iOriginalBusyDelay = oTable.getBusyIndicatorDelay();
		
				this._aTableSearchState = [];

				oViewModel = new JSONModel({
					worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
					shareOnJamTitle: this.getResourceBundle().getText("worklistTitle"),
					shareSendEmailSubject: this.getResourceBundle().getText("shareSendEmailWorklistSubject"),
					shareSendEmailMessage: this.getResourceBundle().getText("shareSendEmailWorklistMessage", [location.href]),
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

			_showObject : function (oItem) {
				this.getRouter().navTo("object", {
					objectId: oItem.getBindingContext().getProperty("MaterialID")
				});
			},

			onPressShowMaterial : function (oEvent) {
				this._showObject(oEvent.getSource());
			},

			onNavBack : function() {
				history.go(-1);
			},

			_loadCreateFragment: function(oEntryContext){
				if(!this.oCreateDialog){
					this.pCreateMaterial = Fragment.load({
						name:"zjblessons.WorklistApp.view.fragment.CreateMaterial",
						controller: this,
						id: "fCreateDialog"
					}).then(oDialog => {
						this.oCreateDialog = oDialog;
						this.getView().addDependent(this.oCreateDialog);
						return Promise.resolve(oDialog);
					});
				}
				this.pCreateMaterial.then(oDialog => {
					oDialog.setBindingContext(oEntryContext);
					oDialog.open();
				})
			},

			_closeCreateDialog: function() {
				this.oCreateDialog.close();
			},

			onPressSaveMaterial: function() {
				this.getModel().submitChanges();
				this._closeCreateDialog();
			},

			onPressCloseCreateDialog: function () {
				this.getModel().resetChanges();
				this._closeCreateDialog();	
			},

			onPressCreateMaterial: function(){
				const mProperties = {
					MaterialID: "0",
					Version: "A",
					Language: "RU"
				};
				const oEntryContext = this.getModel().createEntry("/zjblessons_base_Materials", {
					properties: mProperties
				});
				this._loadCreateFragment(oEntryContext);
			},

			onPressDeleteMaterial: function (oEvent) {
				const sEntryPath = oEvent.getSource().getBindingContext().getPath();

				const oMessageBox = new MessageBox.confirm(this.getResourceBundle().getText("msgDeleteMaterial"), {
					title: "Сonfirm deletion",
					actions: [
						MessageBox.Action.DELETE,
						MessageBox.Action.CANCEL
					],
					emphasizedAction: sap.m.MessageBox.Action.DELETE,
					initialFocus: null,
					onClose: oAction => {
						if (oAction === MessageBox.Action.DELETE) {		
							this.getModel().remove(sEntryPath);
						}
					}
				})
			},

			onSearch : function (oEvent) {
				const aFilters = [];
				const sValue = oEvent.getParameter('query') || oEvent.getParameter('newValue');

				if (sValue) {
					aFilters.push(
						new Filter({
							filters: [
								new Filter({
									path:"MaterialText",
									operator: FilterOperator.Contains,
									value1: sValue
								}),
								new Filter("MaterialDescription", FilterOperator.Contains, sValue),
							
								new Filter({
									filters: [
										new Filter("CreatedByFullName", FilterOperator.Contains, sValue),
										new Filter("ModifiedByFullName", FilterOperator.Contains, sValue),
									],
									and: true
								})
							],
							and: false,
						})
					); 
				}

				this.byId('table').getBinding('items').filter(aFilters);
			},

			onPressRefresh : function () {
				var oTable = this.byId("table");
				oTable.getBinding("items").refresh();
			},

			_applySearch: function(aTableSearchState) {
				var oTable = this.byId("table"),
					oViewModel = this.getModel("worklistView");
				oTable.getBinding("items").filter(aTableSearchState, "Application");
				// changes the noDataText of the list in case there are no filter results
				if (aTableSearchState.length !== 0) {
					oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
				}
		
			}

		});
	}
);