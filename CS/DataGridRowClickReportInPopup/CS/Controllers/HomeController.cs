using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using DevExpress.DataAccess;
using DevExpress.DataAccess.ObjectBinding;
using Microsoft.AspNetCore.Mvc;

namespace dxSampleDataGridAndReport.Controllers
{
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error() {
            return View();
        }
        public IActionResult Viewer(string paramData) {
            ReportParams reportParams = Newtonsoft.Json.JsonConvert.DeserializeObject<ReportParams>(paramData);
            var report = new XtraReport1();
            ObjectDataSource objectDataSource = new ObjectDataSource();
            objectDataSource.BeginUpdate();
            objectDataSource.DataSource = typeof(Models.SampleData);
            objectDataSource.Constructor = new ObjectConstructorInfo();
            objectDataSource.Parameters.Add(new Parameter("orderId", typeof(int), reportParams.OrderId));
            objectDataSource.Parameters.Add(new Parameter("date", typeof(DateTime), reportParams.OrderDate));
            objectDataSource.DataMember = "GetOrders";
            objectDataSource.EndUpdate();
            report.DataSource = objectDataSource;
            return View(report);
        }
    }
    public class ReportParams { 
        public string ReportName { get; set; }
        public int OrderId { get; set; }
        public DateTime OrderDate { get; set; }
    }
}
