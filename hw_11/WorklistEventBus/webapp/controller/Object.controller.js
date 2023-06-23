sap.ui.define([
		"zjblessons/WorklistEventBus/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"zjblessons/WorklistEventBus/model/formatter",
		"sap/m/MessageBox"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter,
		MessageBox
	) {
		"use strict";

		return BaseController.extend("zjblessons.WorklistEventBus.controller.Object", {

			formatter: formatter,

			onInit : function () {
				var iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : true,
						delay : 0
					});
				
				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				this.setModel(oViewModel, "objectView");
				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
						oViewModel.setProperty("/delay", iOriginalBusyDelay);
					}
				);

				const eventBus = this.getOwnerComponent().getEventBus();
				eventBus.subscribe("channelA", "orderSelected", this._bindData, this);
			},

			onNavBack : function() {
				var sPreviousHash = History.getInstance().getPreviousHash();

				if (sPreviousHash !== undefined) {
					history.go(-1);
				} else {
					this.getRouter().navTo("worklist", {}, true);
				}
			},

			_bindView : function (sObjectPath) {
				var oViewModel = this.getModel("objectView"),
					oDataModel = this.getModel();

				this.getView().bindElement({
					path: sObjectPath,
					events: {
						change: this._onBindingChange.bind(this),
						dataRequested: function () {
							oDataModel.metadataLoaded().then(function () {
								oViewModel.setProperty("/busy", true);
							});
						},
						dataReceived: function () {
							oViewModel.setProperty("/busy", false);
						}
					}
				});
			},

			_onBindingChange : function () {
				var oView = this.getView(),
					oViewModel = this.getModel("objectView"),
					oElementBinding = oView.getElementBinding();

				if (!oElementBinding.getBoundContext()) {
					this.getRouter().getTargets().display("objectNotFound");
					return;
				}

				var oResourceBundle = this.getResourceBundle(),
					oObject = oView.getBindingContext().getObject(),
					sObjectId = oObject.MaterialID,
					sObjectName = oObject.MaterialText;

				oViewModel.setProperty("/busy", false);

				oViewModel.setProperty("/shareSendEmailSubject",
				oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
				oViewModel.setProperty("/shareSendEmailMessage",
				oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
			},

			_bindData: function(channelID, eventID, parametersMap){
				const sObjectId = parametersMap.oData.MaterialID;
				this.getModel().setDeferredGroups(["material", "description"]);
				
				this.getModel().metadataLoaded().then( function() {
					var sObjectPath = this.getModel().createKey("zjblessons_base_Materials", {
						MaterialID: sObjectId,
						groupId: ["material", "description"]
					});
					this._bindView("/" + sObjectPath);
				}.bind(this));
			},

			onPressMaterialTextSubmit: function (oEvent) {
				const oInput = this.getView().byId("inputMaterialText");
				const sPath = oEvent.getSource().getBindingContext().getPath();
				const oData = {
					MaterialText: oInput.getValue()
				};
				const mParameters = {
					groupId: "material"
				}

				if (oInput.getValue() !== oInput.getBinding("value").oValue) {
					this.getModel().update(sPath, oData, mParameters);
				}

				this._submitDataChanges("material");
			},

			onPressMaterialDescrSubmit: function (oEvent) {
				const oInput = this.getView().byId("inputMaterialDescr");
				const sPath = oEvent.getSource().getBindingContext().getPath();
				const oData = {
					MaterialDescription: oInput.getValue()
				};
				const mParameters = {
					groupId: "description"
				}

				if (oInput.getValue() !== oInput.getBinding("value").oValue) {
					this.getModel().update(sPath, oData, mParameters);
				}

				this._submitDataChanges("description");
			},

			_submitDataChanges: function (sGroupId) {
				if(this.getModel().hasPendingChanges(true)){
					this.getModel().submitChanges({
						groupId: sGroupId,
						success: () => {
							new MessageBox.success(this.getResourceBundle().getText("msgChangeSuccess"));
						},
						error: ({ message }) => {
							new MessageBox.error(message);
						}
					});
				}
			}

		});

	}
);