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
					tableBusyDelay : 0,
					validateError: false,
					dialogParams: {
						height: "400px",
						width: "250px"
					},
					textAreaHeight: "10em"
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

			_pEscapeHandler: function(oPromise) {
				if(!this.oConfirmEscapePressPreventDialog) {
					this.oConfirmEscapePressPreventDialog = new sap.m.Dialog({
						title: "Are u sure?",
						content: new sap.m.Text({
							text: "Your unsaved changes will be lost"
						}),
						type: sap.m.DialogType.Message,
						icon: sap.ui.core.IconPool.getIconURI("message information"),
						buttons: [
							new sap.m.Button({
								text: "Yes?",
								press: () => {
									this.oConfirmEscapePressPreventDialog.close();
									this.oCreateDialog.close();
								}
							}),
							new sap.m.Button({
								text: "No",
								press: () => this.oConfirmEscapePressPreventDialog.close()
							})
						]
					})
				}

				this.oConfirmEscapePressPreventDialog.open();
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
					oDialog.setEscapeHandler(this._pEscapeHandler.bind(this))
					oDialog.setBindingContext(oEntryContext);
					oDialog.open();
				})
			},

			// _clearCreateDialog: function() {
			// 	this.oCreateDialog.close();
			// },

			_validateSaveMaterial: function() {
				const aFieldsIds = this.getView().getControlsByFieldGroupId();

				aFieldsIds.forEach((oControl) => {
					if(oControl.mProperties.fieldGroupIds[0]){
						oControl.fireValidateFieldGroup()
					}
				})
			},

			onPressSaveMaterial: function() {
				this._validateSaveMaterial();

				if (!this.getModel("worklistView").getProperty("/validateError")) {
					this.getModel().submitChanges();

					this.oCreateDialog.close();
				}
			},

			_clearCreateMaterialDialog: function () {
				const aFieldsIds = this.getView().getControlsByFieldGroupId();

				aFieldsIds.forEach((oControl) => {
					if(oControl.mProperties.fieldGroupIds[0]){
						oControl.setValueState('None');
						oControl.setValueStateText('');
					}
				})
			},

			onPressCloseCreateDialog: function () {
				this._clearCreateMaterialDialog();

				this.getModel().resetChanges();
				this.oCreateDialog.close();	
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
					title: this.getResourceBundle().getText("ttlConfirmDeletion"),
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
		
			},

			onValidateFieldGroup: function(oEvent) {
				const oControl = oEvent.getSource();

				let bSuccess = true;
				let sErrorText;

				switch (oControl.getFieldGroupIds()[0]) {
					case "input":
						bSuccess = !!oControl.getValue();
						sErrorText = this.getResourceBundle().getText("errInput");
						break;

					case "comboBox":
						bSuccess = oControl.getItems().includes(oControl.getSelectedItem());
						sErrorText = this.getResourceBundle().getText("errComboBox");
						break;

					case "inputRating":
						const oType = oControl.getBinding("value").getType();

						if (oControl.getValue()) {
							try {
								oType.validateValue(oType.parseValue(oControl.getValue(), "string"))
							} catch (oError) { 	
								bSuccess = false
								sErrorText = oError.message;
							}
						} 
						else {
							bSuccess = !!oControl.getValue();
							sErrorText = this.getResourceBundle().getText("errInputRating");
						}
					break;	
				
					default:
						break;
				}
				this.getModel("worklistView").setProperty("/validateError", !bSuccess);

				oControl.setValueState(bSuccess ? "None" : "Error");
				oControl.setValueStateText(sErrorText); 
			},

			onBeforeCloseDialog: function(oEvent) {
				const oSource = oEvent.getSource();
				const oDialogSize = oSource._oManuallySetSize;

				if (oDialogSize) {
					this.getModel("worklistView").setProperty(
						"/dialogParams/height", 
						oDialogSize.height + "px"
					);
					this.getModel("worklistView").setProperty(
						"/dialogParams/width", 
						oDialogSize.width + "px"
					);
				}
				else {
					oSource.destroy();
					this.oCreateDialog = null;
				}

				this._clearCreateMaterialDialog();
			},

			onPressMaterialDetailedInfo: function(oEvent) {
				const oSource = oEvent.getSource();

				if (!this._pMaterialDetailedInfoPopover) {
					this._pMaterialDetailedInfoPopover = Fragment.load({
						id: this.getView().getId(),
						name: "zjblessons.WorklistApp.view.fragment.MaterialDetailedInfoPopover",
						controller: this
					}).then(oPopover => {
						this.getView().addDependent(oPopover);
						return oPopover;
					});
				}
				this._pMaterialDetailedInfoPopover.then(oPopover => {
					oPopover.setBindingContext(oSource.getBindingContext());
					oPopover.openBy(oSource);
				});
			},

			onPressOpenMaterial: function(oEvent) {
				this._showObject(oEvent.getSource());
			},

			onPressClosePopover: function(oEvent) {
				oEvent.getSource().getParent().getParent().close();
			},

			onPressOpenActionSheet: function(oEvent) {
				const oSource = oEvent.getSource();

				if (!this._pActionSheet) {
					this._pActionSheet = Fragment.load({
						id: this.getView().getId(),
						name: "zjblessons.WorklistApp.view.fragment.ActionSheet",
						controller: this
					}).then(oActionSheet => {
						this.getView().addDependent(oActionSheet);
						return oActionSheet;
					});
				}
				this._pActionSheet.then(oActionSheet => oActionSheet.openBy(oSource));
			}

		});
	}
);