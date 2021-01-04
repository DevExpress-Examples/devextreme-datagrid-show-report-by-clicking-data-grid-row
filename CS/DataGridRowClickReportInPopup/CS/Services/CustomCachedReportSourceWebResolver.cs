using DevExpress.DataAccess.ObjectBinding;
using DevExpress.XtraReports.Services;
using DevExpress.XtraReports.UI;
using DevExpress.XtraReports.Web;
using DevExpress.XtraReports.Web.WebDocumentViewer;
using dxSampleDataGridAndReport.Models;
using System;
using System.Collections.Generic;
using System.Collections.Specialized;
using System.Linq;
using System.Threading.Tasks;
using System.Web;

namespace dxSampleDataGridAndReport.Services {
    public class CustomCachedReportSourceWebResolver : ICachedReportSourceWebResolver {
        public bool TryGetCachedReportSourceWeb(string reportName, out CachedReportSourceWeb CachedReportSourceWeb) {
            var reportNameParts = reportName.Split("?");
            var currentReportName = reportNameParts[0];

            XtraReport report = null;
            if (currentReportName == "InfoReport") {
                report = new XtraReport1();
                var datasource = SampleData.Orders;
                if (reportNameParts.Length > 1)
                {
                    var reportParams = HttpUtility.ParseQueryString(reportNameParts[1]);
                    datasource = datasource.Where(x =>
                        x.OrderID == Convert.ToInt32(reportParams.Get("orderId"))
                    ).ToList();
                };
                report.DataSource = datasource;
            }
            if (report == null) {
                CachedReportSourceWeb = null;
                return false;
            }
            CachedReportSourceWeb = new CachedReportSourceWeb(report);
            return true;
        }
    }
}
