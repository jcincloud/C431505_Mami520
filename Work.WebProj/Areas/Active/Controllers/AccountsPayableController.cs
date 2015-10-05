using DotWeb.CommSetup;
using DotWeb.Controller;
using ProcCore.Business.LogicConect;
using ProcCore.HandleResult;
using System;
using System.IO;
using System.Web.Mvc;
using System.Linq;

namespace DotWeb.Areas.Active.Controllers
{
    public class AccountsPayableController : AdminController
    {
        #region Action and function section
        public ActionResult Main(int? product_record_id)
        {
            int id = 0;
            db0 = getDB0();
            if (product_record_id != null)
            {
                bool check = db0.AccountsPayable.Any(x => x.product_record_id == product_record_id);
                if (check)
                {//檢查是否有資料
                    int main_id = db0.AccountsPayable.Where(x => x.product_record_id == product_record_id).First().accounts_payable_id;
                    id = main_id;
                }
            }

            ViewBag.main_id = id;
            ActionRun();
            return View();
        }

        #endregion

        #region ajax call section

        public string aj_Init()
        {
            using (var db0 = getDB0())
            {
                var open = openLogic();
                return defJSON(new
                {
                    //breakfast = (decimal)open.getParmValue(ParmDefine.breakfast),
                    //lunch = (decimal)open.getParmValue(ParmDefine.lunch),
                    //dinner = (decimal)open.getParmValue(ParmDefine.dinner)
                });
            }
        }
        #endregion

        #region ajax file section
        [HttpPost]
        public string axFUpload(int id, string filekind, string filename)
        {
            UpFileInfo r = new UpFileInfo();
            #region
            try
            {
                if (filekind == "File1")
                    handleFileSave(filename, id, ImageFileUpParm.NewsBasicSingle, filekind, "News", "News");

                r.result = true;
                r.file_name = filename;
            }
            catch (LogicError ex)
            {
                r.result = false;
                r.message = getRecMessage(ex.Message);
            }
            catch (Exception ex)
            {
                r.result = false;
                r.message = ex.Message;
            }
            #endregion
            return defJSON(r);
        }

        [HttpPost]
        public string axFList(int id, string filekind)
        {
            SerializeFileList r = new SerializeFileList();

            r.files = listDocFiles(id, filekind, "News", "News");
            r.result = true;
            return defJSON(r);
        }

        [HttpPost]
        public string axFDelete(int id, string filekind, string filename)
        {
            ResultInfo r = new ResultInfo();
            DeleteSysFile(id, filekind, filename, ImageFileUpParm.NewsBasicSingle, "News", "News");
            r.result = true;
            return defJSON(r);
        }


        [HttpGet]
        public FileResult axFDown(int id, string filekind, string filename)
        {
            string path_tpl = string.Format(upload_path_tpl_o, "News", "News", id, filekind, filename);
            string server_path = Server.MapPath(path_tpl);
            FileInfo file_info = new FileInfo(server_path);
            FileStream file_stream = new FileStream(server_path, FileMode.Open, FileAccess.Read);
            string web_path = Url.Content(path_tpl);
            return File(file_stream, "application/*", file_info.Name);
        }
        #endregion
    }
}