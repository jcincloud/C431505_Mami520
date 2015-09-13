﻿using DotWeb.CommSetup;
using DotWeb.Controller;
using ProcCore.Business.DB0;
using ProcCore.HandleResult;
using System;
using System.IO;
using System.Linq;
using System.Web.Mvc;

namespace DotWeb.Areas.Active.Controllers
{
    public class FoodController : AdminController
    {
        #region Action and function section
        public ActionResult Main()
        {
            ActionRun();
            return View();
        }
        public ActionResult ElementFood()
        {
            ActionRun();
            return View();
        }
        public ActionResult ConstituteFood()
        {
            ActionRun();
            return View();
        }
        public ActionResult DailyMenu()
        {
            ActionRun();
            return View();
        }
        #endregion

        #region ajax call section

        public string aj_Init()
        {
            using (var db0 = getDB0())
            {
                return defJSON(new
                {
                    // options_equipment_category = db0.Equipment_Category.OrderBy(x=>x.sort)
                });
            }
        }
        public string element_food_Init()
        {
            using (var db0 = getDB0())
            {
                return defJSON(new
                {
                    options_category = db0.All_Category_L2.Where(x => x.all_category_l1_id == CategoryType.ElementFood).OrderByDescending(x => x.sort).Select(x => new option() { val = x.all_category_l2_id, Lname = x.l2_name })
                });
            }
        }
        public string constitute_food_Init()
        {
            using (var db0 = getDB0())
            {
                return defJSON(new
                {
                    options_category = db0.All_Category_L2.Where(x => x.all_category_l1_id == CategoryType.ConstituteFood).OrderByDescending(x => x.sort).Select(x => new option() { val = x.all_category_l2_id, Lname = x.l2_name })
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