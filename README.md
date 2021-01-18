# Web Reporting - How to Display a Report with Details about a Clicked Data Grid Row

In this example, you can click the [DevExtreme Data Grid](https://js.devexpress.com/Demos/Widgetsgallery/Demo/DataGrid/Overview/NetCore/Light/) row to create a report and display it in the [DevExpress Document Viewer](https://docs.devexpress.com/XtraReports/400248/web-reporting/asp-net-core-reporting/document-viewer). The report uses the information displayed in the row to query the data source and retrieve the details.


## How to Display a Report

The repository contains projects that use different containers to display a report.

### Display a report on a separate page

Render the Document Viewer component in a Razor View and bind it to the View Model. Review the following help topic for more information: [Open a Report -> Bind to the View Model](https://docs.devexpress.com/XtraReports/402505/web-reporting/asp-net-core-reporting/document-viewer/open-a-report#bind-to-the-view-model).

Handle the Data Grid's [onRowClick](https://js.devexpress.com/DevExtreme/ApiReference/UI_Widgets/dxDataGrid/Configuration/#onRowClick) event, obtain the clicked row's data and pass it to the controller method. The controller method receives parameters passed from a Data Grid row. Use these parameters to create a report and populate the data source. The controller action returns the report to the Document Viewer.

### Display a report within the DevExtreme Popup widget

Place the the Document Viewer in the [DevExtreme Popup](https://js.devexpress.com/Demos/WidgetsGallery/Demo/Popup/Overview/NetCore/Light/) widget. Handle the Data Grid's [onRowClick](https://js.devexpress.com/DevExtreme/ApiReference/UI_Widgets/dxDataGrid/Configuration/#onRowClick) event to display the popup control that contains the Document Viewer. The Document Viewer calls the client-side [OpenReport](https://docs.devexpress.com/XtraReports/js-DevExpress.Reporting.Viewer.Utils.IPreviewModel#js_devexpress_reporting_viewer_utils_ipreviewmodel_openreport) method with an argument that is a string composed of a report name and the data retrieved from the clicked row. The string (reportURL) is sent to the server.

The Document Viewer uses the [ICachedReportSourceWebResolver](https://docs.devexpress.com/XtraReports/DevExpress.XtraReports.Web.WebDocumentViewer.ICachedReportSourceWebResolver) service on a server to parse the `reportURL` string. The service uses this information to create a report and populate its data source. The controller passes the report instance back to the client-side  Document Viewer.

### Display a report in a detail section of the Data Grid's master-detail interface

Place the Document Viewer in the Data Grid [detail template](https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/MasterDetailView/NetCore/Light/). The `data` object in the detail section contains data for the current row. Compose the `reportUrl` string from the report name and row data. Pass this string to the [OpenReport](https://docs.devexpress.com/XtraReports/js-DevExpress.Reporting.Viewer.Utils.IPreviewModel#js_devexpress_reporting_viewer_utils_ipreviewmodel_openreport) method.

The Document Viewer uses the [ICachedReportSourceWebResolver](https://docs.devexpress.com/XtraReports/DevExpress.XtraReports.Web.WebDocumentViewer.ICachedReportSourceWebResolver) service on a server to parse the `reportURL` string. The service uses this information to create a report and populate its data source. The controller passes the report instance back to the client-side  Document Viewer.

  
## Implementation Details

### Data Grid 

This example uses the [Data Grid](https://js.devexpress.com/Demos/Widgetsgallery/Demo/DataGrid/Overview/NetCore/Light/) to display data from an array of objects. Refer to the following help topic for more information: [ASP.NET Core Data Grid - Simple Array](https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/SimpleArray/NetCore/Light/).

### Document Viewer

This example uses the [DevExpress Document Viewer](https://docs.devexpress.com/XtraReports/400248/web-reporting/asp-net-core-reporting/document-viewer) in an ASP.NET Core application to preview, export, and print DevExpress reports on the client.

Follow the steps described in the following help topic to add the Document Viewer to your application: [Add the Document Viewer to an ASP.NET Core Application](https://docs.devexpress.com/XtraReports/401762/web-reporting/asp-net-core-reporting/document-viewer/quick-start/add-the-document-viewer-to-an-aspnet-core-application). 

### Report

A [report](https://docs.devexpress.com/XtraReports/14651/get-started-with-devexpress-reporting) is bound to an [object data source](https://docs.devexpress.com/XtraReports/17784/detailed-guide-to-devexpress-reporting/bind-reports-to-data/business-object/bind-a-report-to-an-object-data-source). 
For information on how to use the Visual Studio Data Source Wizard to bind a report to the DTO object schema, review the following help topic: [Bind a Report to an Object Data Source -> Run the Wizard and Access the Data Source](https://docs.devexpress.com/XtraReports/17784/detailed-guide-to-devexpress-reporting/bind-reports-to-data/business-object/bind-a-report-to-an-object-data-source#run-the-wizard-and-access-the-data-source).

At runtime, initialize the object data source when you initialize a report instance. Pass parameters to an object data source to retrieve only a subset of data required to display details about the clicked Data Grid row. For more information, review the following help topic: [Create Object Data Source at Runtime](https://docs.devexpress.com/XtraReports/401902/web-reporting/asp-net-core-reporting/document-viewer/bind-to-data/create-object-data-source-for-loaded-report).

## Troubleshooting

### Resolve the client-side errors

When you integrate the Data Grid and the Document Viewer into your application, verify that no conflicts exist between script files that the components require. If there are errors in a browser console, make sure that:
* Script files are registered in the correct order
* There are no duplicate registrations
* The DevExpress script version matches the server-side DevExpress library versions.

For more information, review the following help topics: [Reporting Application Diagnostics](https://docs.devexpress.com/XtraReports/401687/create-end-user-reporting-applications/web-reporting/general-information/application-diagnostics) and [Troubleshooting](https://docs.devexpress.com/XtraReports/401726/web-reporting/general-information/troubleshooting).

