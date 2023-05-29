/*global history */
sap.ui.define([
		"zjblessons/MasterDetailApp/controller/BaseController",
		"sap/ui/model/json/JSONModel",
		"sap/ui/model/Filter",
		"sap/ui/model/FilterOperator",
		"sap/m/GroupHeaderListItem",
		"sap/ui/Device",
		"zjblessons/MasterDetailApp/model/formatter"
	], function (BaseController, JSONModel, Filter, FilterOperator, GroupHeaderListItem, Device, formatter) {
		"use strict";

		return BaseController.extend("zjblessons.MasterDetailApp.controller.Master", {

			formatter: formatter,

			onInit : function () {
				var oList = this.byId("list"),
					oViewModel = this._createViewModel(),
					iOriginalBusyDelay = oList.getBusyIndicatorDelay();


				this._oList = oList;
				this._oListFilterState = {
					aFilter : [],
					aSearch : []
				};

				this.setModel(oViewModel, "masterView");

				oList.attachEventOnce("updateFinished", function(){
					oViewModel.setProperty("/delay", iOriginalBusyDelay);
				});

				this.getView().addEventDelegate({
					onBeforeFirstShow: function () {
						this.getOwnerComponent().oListSelector.setBoundMasterList(oList);
					}.bind(this)
				});

				this.getRouter().getRoute("object").attachPatternMatched(this._onMasterMatched, this);
				this.getRouter().attachBypassed(this.onBypassed, this);
			},

			onUpdateFinished : function (oEvent) {
				this._updateListItemCount(oEvent.getParameter("total"));
				this.byId("pullToRefresh").hide();
			},

			onSearch : function (oEvent) {
				if (oEvent.getParameters().refreshButtonPressed) {
					this.onRefresh();
					return;
				}

				var sQuery = oEvent.getParameter("query");

				if (sQuery) {
					this._oListFilterState.aSearch = [new Filter("ModifiedByFullName", FilterOperator.Contains, sQuery)];
				} else {
					this._oListFilterState.aSearch = [];
				}
				this._applyFilterSearch();

			},

			onRefresh : function () {
				this._oList.getBinding("items").refresh();
			},

			_showDetail : function (oItem) {
				this.getRouter().navTo("object", {
					entity: oItem.getCustomData()[0].getKey(),
				});
			},

			onSelectionChange : function (oEvent) {
				this._showDetail(oEvent.getParameter("listItem"));
			},

			onBypassed : function () {
				this._oList.removeSelections(true);
			},

			createGroupHeader : function (oGroup) {
				return new GroupHeaderListItem({
					title : oGroup.text,
					upperCase : false
				});
			},

			onNavBack : function() {
				history.go(-1);
			},

			_createViewModel : function() {
				return new JSONModel({
					isFilterBarVisible: false,
					filterBarLabel: "",
					delay: 0,
					title: this.getResourceBundle().getText("masterTitleCount", [0]),
					noDataText: this.getResourceBundle().getText("masterListNoDataText"),
					sortBy: "ModifiedByFullName",
					groupBy: "None"
				});
			},

			_onMasterMatched :  function(oEvent) {
				let sEntity = oEvent.getParameter("arguments").entity;
				this.byId("list").getItems().forEach(function (oItem) {
					if (oItem.getCustomData()[0].getKey() === sEntity) {
						oItem.setSelected(true);
					}
				}.bind(this));
			},

			_updateListItemCount : function (iTotalItems) {
				var sTitle;

				if (this._oList.getBinding("items").isLengthFinal()) {
					sTitle = this.getResourceBundle().getText("masterTitleCount", [iTotalItems]);
					this.getModel("masterView").setProperty("/title", sTitle);
				}
			},

			_applyFilterSearch : function () {
				var aFilters = this._oListFilterState.aSearch.concat(this._oListFilterState.aFilter),
					oViewModel = this.getModel("masterView");
				this._oList.getBinding("items").filter(aFilters, "Application");
				
				if (aFilters.length !== 0) {
					oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataWithFilterOrSearchText"));
				} else if (this._oListFilterState.aSearch.length > 0) {
					oViewModel.setProperty("/noDataText", this.getResourceBundle().getText("masterListNoDataText"));
				}
			},

			_applyGroupSort : function (aSorters) {
				this._oList.getBinding("items").sort(aSorters);
			},

			_updateFilterBar : function (sFilterBarText) {
				var oViewModel = this.getModel("masterView");
				oViewModel.setProperty("/isFilterBarVisible", (this._oListFilterState.aFilter.length > 0));
				oViewModel.setProperty("/filterBarLabel", this.getResourceBundle().getText("masterFilterBarText", [sFilterBarText]));
			}

		});

	}
);