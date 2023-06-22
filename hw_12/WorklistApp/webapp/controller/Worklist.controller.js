sap.ui.define([
		"zjblessons/WorklistApp/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"zjblessons/WorklistApp/model/formatter",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/ui/core/Fragment",
		"sap/m/MessageBox",
		"sap/m/MessagePopover"
	], function (
		BaseController,
		JSONModel,
		formatter,
		Filter, 
		FilterOperator, 
		Fragment, 
		MessageBox, 
		MessagePopover
	) {
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
					textAreaHeight: "10em",
					Messages: []
				});
				this.setModel(oViewModel, "worklistView");

				oTable.attachEventOnce("updateFinished", function(){
					oViewModel.setProperty("/tableBusyDelay", iOriginalBusyDelay);
				});

				const oLink = new  sap.m.Link({
					text: this.getResourceBundle().getText("msgShowMoreInfo"),
					href: "http://sap.com",
					target: "_blank"
				});
	
				const oMessageTemplate = new sap.m.MessageItem({
					type: "{worklistView>type}",
					title: "{worklistView>title}",
					activeTitle: "{worklistView>active}",
					description: "{worklistView>description}",
					subtitle: "{worklistView>subtitle}",
					counter: "{worklistView>counter}",
					link: oLink
				});
	
				this._oMessagePopover = new MessagePopover({
					items: {
						model: "worklistView",
						path: "worklistView>/Messages",
						template: oMessageTemplate
					}
				});
	
				this.byId("messagePopoverBtn").addDependent(this._oMessagePopover);
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

			_addMessageInformation: function(oEvent) {
				const aMessages = this.getModel("worklistView").getProperty("/Messages").slice();

				let sMaterialText;

				if (oEvent.getSource().mAggregations.cells) {
					sMaterialText = oEvent.getSource().mAggregations.cells[0].mProperties.text;
				} else {
					sMaterialText = oEvent.getSource().getParent().getParent().getTitle();
				}

				aMessages.push({
					type: "Information",
					title: this.getResourceBundle().getText("ttlMsgInformation"),
					description: `${sMaterialText}`,
					subtitle: `
						${this.getResourceBundle().getText("ttlMaterialText")} 
						${sMaterialText} 
						${this.getResourceBundle().getText("msgInformation")}`,
					counter: 1
				})

				this.getModel("worklistView").setProperty("/Messages", aMessages);
			},

			_showObject : function (oItem) {
				this._addMessageInformation(oItem);

				this.getRouter().navTo("object", {
					objectId: oItem.getSource().getBindingContext().getProperty("MaterialID")
				});
			},

			onPressShowMaterial : function (oEvent) {
				this._showObject(oEvent);
			},

			onNavBack : function() {
				history.go(-1);
			},

			_pEscapeHandler: function(oPromise) {
				if(!this.oConfirmEscapePressPreventDialog) {
					this.oConfirmEscapePressPreventDialog = new sap.m.Dialog({
						title: this.getResourceBundle().getText("ttlEscapeHandler"),
						content: new sap.m.Text({
							text: this.getResourceBundle().getText("infEscapeHandler")
						}),
						type: sap.m.DialogType.Message,
						icon: sap.ui.core.IconPool.getIconURI("message information"),
						buttons: [
							new sap.m.Button({
								text: this.getResourceBundle().getText("btnYesEscapeHandler"),
								press: () => {
									this.oConfirmEscapePressPreventDialog.close();
									this.oCreateDialog.close();
								}
							}),
							new sap.m.Button({
								text: this.getResourceBundle().getText("btnNoEscapeHandler"),
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

			_validateSaveMaterial: function() {
				const aFieldsIds = this.getView().getControlsByFieldGroupId();

				aFieldsIds.forEach((oControl) => {
					if(oControl.mProperties.fieldGroupIds[0]){
						oControl.fireValidateFieldGroup()
					}
				})
			},

			_addMessageCreated: function(oData) {
				const aMessages = this.getModel("worklistView").getProperty("/Messages").slice();
				const oDataResponse = oData.__batchResponses[0].__changeResponses[0].data;

				aMessages.push({
					type: "Success",
					title: this.getResourceBundle().getText("ttlMsgCreated"),
					description: `${oDataResponse.MaterialDescription}`,
					subtitle: `
						${this.getResourceBundle().getText("ttlMaterialText")} 
						${oDataResponse.MaterialText} 
						${this.getResourceBundle().getText("msgCreated")}`,
					counter: 1
				})

				this.getModel("worklistView").setProperty("/Messages", aMessages);
			},

			_addMessageCreatedError: function(sMessage, sStatusText) {
				const aMessages = this.getModel("worklistView").getProperty("/Messages").slice();

				aMessages.push({
					type: 'Error',
					title: this.getResourceBundle().getText("ttlMsgCreatedError"),
					description: `${this.getResourceBundle().getText("msgCreatedErrorDescr")} ${sMessage}`,
					subtitle: `${this.getResourceBundle().getText("msgCreatedErrorSubTtl")} ${sStatusText}`,
					counter: 1
				})

				this.getModel("worklistView").setProperty("/Messages", aMessages);
			},

			onPressSaveMaterial: function() {
				this._validateSaveMaterial();

				if (!this.getModel("worklistView").getProperty("/validateError")) {
					this.getModel().submitChanges({
						success: oData => {
							if (oData.__batchResponses[0].response === "undefined") {
								this._addMessageCreated(oData);
							}
							else if (oData.__batchResponses[0].response.statusCode === "400") {
								this._addMessageCreatedError(
									oData.__batchResponses[0].message, 
									oData.__batchResponses[0].response.statusText
								);
							}
						}
					});

					this.oCreateDialog.close();
				}
			},

			_clearCreateMaterialDialog: function () {
				const aFieldsIds = this.getView().getControlsByFieldGroupId();

				aFieldsIds.forEach((oControl) => {
					if(oControl.mProperties.fieldGroupIds[0]){
						oControl.setValue("")
						oControl.setValueState("None");
						oControl.setValueStateText("");
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

			_addMessageDeleted: function() {
				const aMessages = this.getModel("worklistView").getProperty("/Messages").slice();

				aMessages.push({
					type: "Warning",
					title: this.getResourceBundle().getText("ttlMsgDeleted"),
					description: `
						${this._oDeletedMaterial.MaterialDescription}, 
						${this._oDeletedMaterial.GroupText}, 
						${this._oDeletedMaterial.SubGroupText}`,
					subtitle: `
						${this.getResourceBundle().getText("ttlMaterialText")} 
						${this._oDeletedMaterial.MaterialText} 
						${this.getResourceBundle().getText("msgDeleted")}`,
					counter: 1
				})

				this.getModel("worklistView").setProperty("/Messages", aMessages);
			},

			_addMessageDeletedError: function(oError) {
				const aMessages = this.getModel("worklistView").getProperty("/Messages").slice();

				aMessages.push({
					type: "Error",
					title: this.getResourceBundle().getText("ttlMsgDeleted"),
					description: `${this.getResourceBundle().getText("msgDeletedErrorDescr")} ${oError.message}`,
					subtitle: `
						${this.getResourceBundle().getText("ttlMaterialText")} 
						${this._oDeletedMaterial.MaterialText} 
						${this.getResourceBundle().getText("msgDeletedErrorSubTtl")}`,
					counter: 1
				})

				this.getModel("worklistView").setProperty("/Messages", aMessages);
			},

			onPressDeleteMaterial: function (oEvent) {
				const sEntryPath = oEvent.getSource().getBindingContext().getPath();

				this._oDeletedMaterial = oEvent.getSource().getBindingContext().getObject();

				const oMessageBox = new MessageBox.confirm(this.getResourceBundle().getText("msgDeleteMaterial"), {
					title: this.getResourceBundle().getText("ttlConfirmDeletion"),
					actions: [
						MessageBox.Action.DELETE,
						MessageBox.Action.CANCEL
					],
					emphasizedAction: sap.m.MessageBox.Action.DELETE,
					initialFocus: null,
					onClose: (oAction) => {
						if (oAction === MessageBox.Action.DELETE) {		
							this.getModel().remove(sEntryPath, {
								success: () => {
									this._addMessageDeleted();
								},
								error: (oError) => {
									this._addMessageDeletedError(oError);
								}
							});
						}
					}
				})
			},

			onPressRefresh : function () {
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

			onBeforeCloseCreateMaterial: function(oEvent) {
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

			onPressOpenMaterialPopover: function(oEvent) {
				this._showObject(oEvent);
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
			},

			onPressMessagePopover: function(oEvent) {
				this._oMessagePopover.toggle(oEvent.getSource());
			},

			onPressOpenSelectDialog: function() {
				if(!this._pSelectDialog){
					this._pSelectDialog = Fragment.load({
						name:"zjblessons.WorklistApp.view.fragment.SelectDialog",
						controller: this,
						id: this.getView().getId()
					}).then(oDialog => {
						this.getView().addDependent(oDialog);
						return Promise.resolve(oDialog);
					});
				}
				this._pSelectDialog.then(oDialog => {
					oDialog.open();
					oDialog.getBinding("items").filter([]);
				})
			},

			_getFilters: function (sValue) {
				const aFilters = [];

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

				return aFilters;
			},

			onSearch: function (oEvent) {
				const sValue = oEvent.getParameter('query') || oEvent.getParameter('newValue');

				this.byId('table').getBinding('items').filter(this._getFilters(sValue));
			},

			onSearchSelectDialog: function(oEvent) {
				const sValue = oEvent.getParameter("value");
				oEvent.getParameter("itemsBinding").filter(this._getFilters(sValue));
			},

			onPressOpenAuthDialog: function() {
				if(!this._oAuthDialog){
					this._pAuthDialog = Fragment.load({
						name:"zjblessons.WorklistApp.view.fragment.Auth",
						controller: this,
						id: this.getView().getId()
					}).then(oDialog => {
						this._oAuthDialog = oDialog;
						this.getView().addDependent(this._oAuthDialog);
						return Promise.resolve(oDialog);
					});
				}
				this._pAuthDialog.then(oDialog => {
					oDialog.open();
				})
			},

			_validateAuth: function() {
				const aFieldsIds = this.getView().getControlsByFieldGroupId();

				aFieldsIds.forEach((oControl) => {
					if(oControl.mProperties.fieldGroupIds[0]){
						oControl.fireValidateFieldGroup();
					}
				})
			},

			onPressSaveAuth: function () {
				this._validateAuth();
			},

			onPressCloseAuthDialog: function () {
				this._clearCreateMaterialDialog();

				this.getModel().resetChanges();
				this._oAuthDialog.close();	
			},

			_validateEmail: function(sValue){
				const emailRegexp = /[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$/;
				if(!emailRegexp.test(sValue)){
					throw new Error(this.getResourceBundle().getText("msgValidateEmailError"));
				}
				return emailRegexp.test(sValue);
			},

			onValidateAuthFields: function(oEvent) {
				const oControl = oEvent.getSource();
				const oDialog = oControl.getParent().getParent();
				
				let bSuccess = true;

				switch(oControl.getProperty("fieldGroupIds")[0]){
					case "input":
						bSuccess = !!oControl.getValue();
						break;	
					case "inputEmail":
						try{
							bSuccess = this._validateEmail(oControl.getValue());
						} catch(oError){
							bSuccess=false
							this._createErrorMessageStrip(oControl, oError);
						}
						break;
					case "datePicker":
						bSuccess = !!oControl.getValue() && oControl.isValidValue();
						break;
					case "timePicker":
						bSuccess = !!oControl.getValue() && oControl._isValidValue();
						break;
				}

				try{	
					oControl.setValueState(bSuccess ? "None": "Error");
				} catch(oError){
					switch(oDialog.getId().replace("WorklistApp---worklist--", "")){
						case "authDialog":
							sap.m.MessageToast.show(oError.message);
							break;
						case "dateTimeDialog":
							this._createErrorMessageStrip(oControl, oError);
							break;
						default:
							sap.m.MessageToast.show(oError.message);
							break;
					}
				} finally{
					this._setSaveBtnAbility(oControl, bSuccess);
				}

				
			},

			_setSaveBtnAbility: function(oControl, bSuccess) {
				if (!!oControl.getParent().getParent().mAggregations.beginButton) {
					oControl.getParent().getParent().mAggregations.beginButton.setEnabled(bSuccess);
				} else {
					oControl.getParent().getParent().mAggregations.beginButton.setEnabled(!bSuccess);
				}
				
			},

			onBeforeCloseAuth: function(oEvent){
				if(this.oMessageStrip) {
					this.oMessageStrip.close();
					this.oMessageStrip = null;
				};

				this.getModel().resetChanges();
				this._clearCreateMaterialDialog();

				oEvent.getSource().mAggregations.beginButton.setEnabled(true);
			},

			_createErrorMessageStrip: function(oControl, oError){
				if(!this.oMessageStrip) {
					this.oMessageStrip = new sap.m.MessageStrip({
						type: "Error",
						text: `${oError}`,
						showCloseButton: true,
						close: () => this.oMessageStrip = null
					});

					oControl.getParent().getParent().addContent(this.oMessageStrip);
				}			
			},

			onPressOpenDateTimeDialog: function () {
				if(!this._oDateTimeDialog){
					this._pDateTimeDialog = Fragment.load({
						name:"zjblessons.WorklistApp.view.fragment.DateTime",
						controller: this,
						id: this.getView().getId()
					}).then(oDialog => {
						this._oDateTimeDialog = oDialog;
						this.getView().addDependent(this._oDateTimeDialog);
						return Promise.resolve(oDialog);
					});
				}
				this._pDateTimeDialog.then(oDialog => {
					oDialog.open();
				})
			},

			onPressCloseDateTimeDialog: function () {
				this._clearCreateMaterialDialog();

				this.getModel().resetChanges();
				this._oDateTimeDialog.close();	
			},

			onPressReadMaterials: function() {
				this.getRouter().navTo("list");
			}
		});
	}
);