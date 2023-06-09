sap.ui.define([
		"zjblessons/WorklistApp/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/core/routing/History",
		"zjblessons/WorklistApp/model/formatter",
		"sap/m/MessageBox",
		"sap/ui/core/Fragment"
	], function (
		BaseController,
		JSONModel,
		History,
		formatter,
		MessageBox,
		Fragment,
	) {
		"use strict";

		return BaseController.extend("zjblessons.WorklistApp.controller.Object", {

			formatter: formatter,

			onInit : function () {
				this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);

				let iOriginalBusyDelay,
					oViewModel = new JSONModel({
						busy : true,
						delay : 0,
						editMode: false,
						selectedKeyITB: "list"
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

			_bindGroupSelect: function () {
				this.byId("groupSelect").bindItems({
					path: "/zjblessons_base_Groups",
					template: new sap.ui.core.Item({
						key: "{GroupID}",
						text: "{GroupText}"
					}),
					sorter: new sap.ui.model.Sorter("GroupText", false),
					filters: new sap.ui.model.Filter("GroupText", sap.ui.model.FilterOperator.NE, null)
				})
			},

			_getSubGroupSelectTemplate: function () {
				return new Promise((resolve, reject) => {
					if (!this._pSubGroupSelectTemplate) {
						this._pSubGroupSelectTemplate = Fragment.load({
							id: this.getView().getId(),
							name: "zjblessons.WorklistApp.view.fragment.SubGroupSelectTemplate",
							controller: this
						}).then(oTemplate => oTemplate);
					}
					this._pSubGroupSelectTemplate.then(oTemplate => {
						resolve(oTemplate);
					}).catch(oError => {
						MessageBox.error(oError.toString());
						reject();
					})
				})	
			},

			_bindSubGroupSelect: function () {
				this._getSubGroupSelectTemplate().then(oTemplate => {
					this.byId("subGroupSelect").bindAggregation("items", {
						path: "/zjblessons_base_SubGroups",
						template: oTemplate,
						sorter: new sap.ui.model.Sorter("SubGroupText", false),
						filters: new sap.ui.model.Filter("SubGroupText", sap.ui.model.FilterOperator.NE, null)
					})
				}).catch(() => {
					this._setEditMode(false);
				})
			},

			_setEditMode: function (bMode) {
				this.getModel("objectView").setProperty("/editMode", bMode);
				const sSelectedKey = this.getModel("objectView").getProperty("/selectedKeyITB");

				if (bMode) {
					this._bindGroupSelect();
					this._bindSubGroupSelect();
				}

				if (sSelectedKey === "form") {
					this._addFormContent(bMode ? "Edit" : "View"); 
				}
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
					const oMessageBox = new MessageBox.confirm(this.getResourceBundle().getText("msgSaveChanges"), {
						title: this.getResourceBundle().getText("ttlConfirmAction"),
						actions: [
							MessageBox.Action.OK,
							MessageBox.Action.CANCEL,
							MessageBox.Action.CLOSE,

						],
						emphasizedAction: sap.m.MessageBox.Action.OK,
						initialFocus: null,
						onClose: oAction => {
							if (oAction === MessageBox.Action.OK) {
								this.onPressSaveMaterial();		
							}
							else if (oAction === MessageBox.Action.CANCEL) {
								this.onPressCancelEditMaterial();
							}
						}

					})

					this._setEditMode(true);
				}
				else {
					this._setEditMode(bState);
				}
			},

			_addFormContent: function(sMode) {
				if (!this[`_pForm${sMode}`]) {
					this[`_pForm${sMode}`] = Fragment.load({
						id: this.getView().getId(),
						name: "zjblessons.WorklistApp.view.fragment.Form" + sMode,
						controller: this,
					}).then(oContent => {
						this.getView().addDependent(oContent);
						return oContent;
					});
				}

				this[`_pForm${sMode}`].then(oContent => {
					const oIconTabFilter = this.byId("formIconTabFilter");

					oIconTabFilter.removeAllContent();
					oIconTabFilter.insertContent(oContent, 0);
				})
			},

			onSelectIconTabBar: function (oEvent) {
				const sSelectedKey = oEvent.getSource().getSelectedKey();
				this.getModel("objectView").setProperty("/selectedKeyITB", sSelectedKey);

				if (sSelectedKey !== "form") return;

				this._addFormContent("View");
			}

		});

	}
);