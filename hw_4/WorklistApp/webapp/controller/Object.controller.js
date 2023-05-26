sap.ui.define([
		"zjblessons/WorklistApp/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"zjblessons/WorklistApp/model/formatter"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter
	) {
		"use strict";

		return BaseController.extend("zjblessons.WorklistApp.controller.Object", {

			formatter: formatter,

			onInit : function () {
				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				let iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : true,
						delay : 3,
						editMode: false
					});
				this.setModel(oViewModel, "objectView");

				iOriginalBusyDelay = this.getView().getBusyIndicatorDelay();
				this.getOwnerComponent().getModel().metadataLoaded().then(function () {
						oViewModel.setProperty("/delay", iOriginalBusyDelay);
					}
				);
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
				const oViewModel = this.getModel("objectView"),
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

			_onObjectMatched : function (oEvent) {
				const sObjectId =  oEvent.getParameter("arguments").objectId;
				this.getModel().metadataLoaded().then( function() {
					const sObjectPath = this.getModel().createKey("/zjblessons_base_Materials", {
						MaterialID :  sObjectId
					});
					this._bindView(sObjectPath);
				}.bind(this));
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
			},

			_setEditMode: function (bMode) {
				this.getModel("objectView").setProperty("/editMode", bMode);
			},

			onPressEditMaterial: function () {
				this._setEditMode(true);
			},

			onPressSaveMaterial: function () {
				this.getModel().submitChanges();
				this._setEditMode(false);
			},

			onPressCancelEditMaterial: function () {
				this.getModel().resetChanges();		
				this._setEditMode(false);	
			},

			onChangeMode: function(oEvent) {
				const bState = oEvent.getParameter("state");

				if (!bState && this.getModel().hasPendingChanges()) {
					this._setEditMode(true);
				}
				else {
					this._setEditMode(bState);
				}
			}

		});

	}
);