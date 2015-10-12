using DotWeb.Api;
using DotWeb.Controller;
using OfficeOpenXml;
using OfficeOpenXml.Style;
using ProcCore.Business.DB0;
using ProcCore.Business.LogicConect;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace DotWeb.Areas.Base.Controllers
{
    public class ExcelReportController : AdminController
    {
        // GET: ExcelReport
        public FileResult downloadExcel_DailyMeal(ParmGetDailyMealInfo parm)
        {
            ExcelPackage excel = null;
            MemoryStream fs = null;
            var db0 = getDB0();
            try
            {

                fs = new MemoryStream();
                excel = new ExcelPackage(fs);
                excel.Workbook.Worksheets.Add("DailyMealData");
                ExcelWorksheet sheet = excel.Workbook.Worksheets["DailyMealData"];

                sheet.View.TabSelected = true;
                #region 取得用餐排程
                R01_DailyMeal data = new R01_DailyMeal();
                Matters matters = new Matters();

                //取得正在用餐日期內的客戶生產編號
                var all_born_id = db0.RecordDetail.Where(x => x.product_type == (int)ProdyctType.PostnatalMeal & x.real_meal_start <= parm.meal_day & x.real_meal_end >= parm.meal_day & x.is_release == false)
                                                      .OrderBy(x => x.meal_id)
                                                      .Select(x => new { x.born_id, x.meal_id, x.real_meal_start, x.real_meal_end }).ToList();

                MealDay pause_meal = new MealDay();
                MealDay start_meal = new MealDay();
                MealDay end_meal = new MealDay();
                #region 塞空資料
                pause_meal.breakfast = new List<string>();
                pause_meal.lunch = new List<string>();
                pause_meal.dinner = new List<string>();
                start_meal.breakfast = new List<string>();
                start_meal.lunch = new List<string>();
                start_meal.dinner = new List<string>();
                end_meal.breakfast = new List<string>();
                end_meal.lunch = new List<string>();
                end_meal.dinner = new List<string>();
                #endregion
                foreach (var born_id in all_born_id)
                {
                    #region 停餐
                    var pause_DailyMeal = db0.DailyMeal.Where(x => x.born_id == born_id.born_id &
                                                                x.product_type == (int)ProdyctType.PostnatalMeal &
                                                                x.meal_day == parm.meal_day).FirstOrDefault();
                    if (pause_DailyMeal == null)
                    {
                        pause_meal.breakfast.Add(born_id.meal_id);
                        pause_meal.lunch.Add(born_id.meal_id);
                        pause_meal.dinner.Add(born_id.meal_id);
                    }
                    else
                    {
                        if (pause_DailyMeal.breakfast_state <= 0)
                            pause_meal.breakfast.Add(born_id.meal_id);
                        if (pause_DailyMeal.lunch_state <= 0)
                            pause_meal.lunch.Add(born_id.meal_id);
                        if (pause_DailyMeal.dinner_state <= 0)
                            pause_meal.dinner.Add(born_id.meal_id);
                    }
                    #endregion

                    #region 開始
                    var start_DailyMeal = db0.DailyMeal.Where(x => x.born_id == born_id.born_id &
                                                                   x.product_type == (int)ProdyctType.PostnatalMeal &
                                                                  (x.breakfast_state > 0 || x.lunch_state > 0 || x.dinner_state > 0))
                                                       .OrderBy(x => x.meal_day).FirstOrDefault();
                    if (start_DailyMeal.meal_day == parm.meal_day)//開始用餐日期為當日
                    {
                        if (start_DailyMeal.breakfast_state > 0)
                        {
                            start_meal.breakfast.Add(born_id.meal_id);
                        }
                        else if (start_DailyMeal.lunch_state > 0)
                        {
                            start_meal.lunch.Add(born_id.meal_id);

                        }
                        else if (start_DailyMeal.dinner_state > 0)
                        {
                            start_meal.dinner.Add(born_id.meal_id);
                        }
                    }
                    #endregion

                    #region 結束
                    var end_DailyMeal = db0.DailyMeal.Where(x => x.born_id == born_id.born_id &
                                            x.product_type == (int)ProdyctType.PostnatalMeal &
                                            (x.breakfast_state > 0 || x.lunch_state > 0 || x.dinner_state > 0))
                                            .OrderByDescending(x => x.meal_day).FirstOrDefault();
                    if (end_DailyMeal.meal_day == parm.meal_day)//結束用餐日期為當日
                    {
                        if (end_DailyMeal.dinner_state > 0)
                        {
                            end_meal.dinner.Add(born_id.meal_id);
                        }
                        else if (end_DailyMeal.lunch_state > 0)
                        {
                            end_meal.lunch.Add(born_id.meal_id);
                        }
                        else if (end_DailyMeal.breakfast_state > 0)
                        {
                            end_meal.breakfast.Add(born_id.meal_id);
                        }
                    }
                    #endregion
                }
                matters.pause_meal = pause_meal;
                matters.start_meal = start_meal;
                matters.end_meal = end_meal;


                //取得今天用餐排程
                var getDailyMeal = db0.DailyMeal.Where(x => x.meal_day == parm.meal_day && x.product_type == (int)ProdyctType.PostnatalMeal).OrderBy(x => x.meal_id).ToList();

                List<Require> special_diet = new List<Require>();
                MealDiet breakfast = new MealDiet();
                MealDiet lunch = new MealDiet();
                MealDiet dinner = new MealDiet();
                breakfast.dishs = new List<Dish>();
                lunch.dishs = new List<Dish>();
                dinner.dishs = new List<Dish>();

                #region 取得三餐菜單
                //取得當日菜單
                var getDailyMenu = db0.DailyMenu.Where(x => x.day == parm.meal_day).ToList();
                foreach (var DailyMenu_item in getDailyMenu)
                {
                    #region 取得對應組合菜單
                    List<Dish> dishs = new List<Dish>();
                    var constitute_id = db0.DailyMenuOfConstitute.Where(x => x.dail_menu_id == DailyMenu_item.dail_menu_id).Select(x => new { x.constitute_id, x.ConstituteFood.constitute_name }).ToList();
                    foreach (var id in constitute_id)
                    {
                        List<Require> Empty_RequireData = new List<Require>();
                        var dish = new Dish()
                        {
                            constitute_id = id.constitute_id,
                            dish_name = id.constitute_name,
                            meal_diet = Empty_RequireData//暫時塞空資料
                        };
                        dishs.Add(dish);
                    }
                    #endregion
                    if (DailyMenu_item.meal_type == (int)MealType.Breakfast)
                    {
                        breakfast.dishs = dishs;
                        breakfast.isHaveData = true;
                    }
                    if (DailyMenu_item.meal_type == (int)MealType.Lunch)
                    {
                        lunch.dishs = dishs;
                        lunch.isHaveData = true;
                    }
                    if (DailyMenu_item.meal_type == (int)MealType.Dinner)
                    {
                        dinner.dishs = dishs;
                        dinner.isHaveData = true;
                    }
                }
                #endregion

                foreach (var DailyMeal_Item in getDailyMeal)
                {
                    if (DailyMeal_Item.breakfast_state > 0 || DailyMeal_Item.lunch_state > 0 || DailyMeal_Item.dinner_state > 0)
                    {//只要三餐有一餐有,就列特殊飲食
                        //取得該客戶需求元素id
                        var dietary_need_id = db0.CustomerOfDietaryNeed.Where(x => x.CustomerNeed.born_id == DailyMeal_Item.born_id).Select(x => x.dietary_need_id);

                        #region 無對應特殊飲食習慣
                        //未對應
                        var no_correspond = db0.DietaryNeed.Where(x => dietary_need_id.Contains(x.dietary_need_id) & !x.is_correspond).ToList();
                        foreach (var dn_item in no_correspond)
                        {
                            //檢查此特殊飲食是否出現過
                            bool check_r = special_diet.Any(x => x.dietary_need_id == dn_item.dietary_need_id);
                            if (check_r)
                            {
                                var s = special_diet.Where(x => x.dietary_need_id == dn_item.dietary_need_id).FirstOrDefault();
                                s.count = s.count + 1;
                                s.meal_id.Add(DailyMeal_Item.meal_id);
                            }
                            else
                            {
                                List<string> meal_id = new List<string>();
                                meal_id.Add(DailyMeal_Item.meal_id);
                                var s = new Require()
                                {
                                    dietary_need_id = dn_item.dietary_need_id,
                                    require_name = dn_item.short_name,
                                    count = 1,
                                    meal_id = meal_id
                                };
                                special_diet.Add(s);
                            }
                        }
                        #endregion

                        #region 有對應特殊飲食習慣
                        //有對應
                        var correspond = db0.DietaryNeed.Where(x => dietary_need_id.Contains(x.dietary_need_id) & x.is_correspond).ToList();
                        foreach (var dn_item in correspond)
                        {
                            #region 早餐
                            if (DailyMeal_Item.breakfast_state > 0 && dn_item.is_breakfast && breakfast.isHaveData)
                            {

                                foreach (var b in breakfast.dishs)
                                {
                                    //取得菜單元素對應元素
                                    var b_element_id = db0.ConstituteOfElement.Where(x => x.constitute_id == b.constitute_id).Select(x => x.element_id).ToList();
                                    //如果和需求元素對應元素d有重疊
                                    bool check_element_id = db0.DietaryNeedOfElement.Any(x => b_element_id.Contains(x.element_id) && x.dietary_need_id == dn_item.dietary_need_id);
                                    #region 有重疊就加入
                                    if (check_element_id)
                                    {
                                        //檢查此飲食是否在此餐出現過
                                        bool check_b = b.meal_diet.Any(x => x.dietary_need_id == dn_item.dietary_need_id);
                                        if (check_b)
                                        {
                                            var s = b.meal_diet.Where(x => x.dietary_need_id == dn_item.dietary_need_id).FirstOrDefault();
                                            s.count = s.count + 1;
                                            s.meal_id.Add(DailyMeal_Item.meal_id);
                                        }
                                        else
                                        {
                                            List<string> meal_id = new List<string>();
                                            meal_id.Add(DailyMeal_Item.meal_id);
                                            var s = new Require()
                                            {
                                                dietary_need_id = dn_item.dietary_need_id,
                                                require_name = dn_item.short_name,
                                                count = 1,
                                                meal_id = meal_id
                                            };
                                            b.meal_diet.Add(s);
                                        }
                                    }
                                    #endregion
                                }
                            }
                            #endregion
                            #region 午餐
                            if (DailyMeal_Item.lunch_state > 0 && dn_item.is_lunch && lunch.isHaveData)
                            {

                                foreach (var l in lunch.dishs)
                                {
                                    //取得菜單元素對應元素
                                    var l_element_id = db0.ConstituteOfElement.Where(x => x.constitute_id == l.constitute_id).Select(x => x.element_id).ToList();
                                    //如果和需求元素對應元素d有重疊
                                    bool check_element_id = db0.DietaryNeedOfElement.Any(x => l_element_id.Contains(x.element_id) && x.dietary_need_id == dn_item.dietary_need_id);
                                    #region 有重疊就加入
                                    if (check_element_id)
                                    {
                                        //檢查此飲食是否在此餐出現過
                                        bool check_l = l.meal_diet.Any(x => x.dietary_need_id == dn_item.dietary_need_id);
                                        if (check_l)
                                        {
                                            var s = l.meal_diet.Where(x => x.dietary_need_id == dn_item.dietary_need_id).FirstOrDefault();
                                            s.count = s.count + 1;
                                            s.meal_id.Add(DailyMeal_Item.meal_id);
                                        }
                                        else
                                        {
                                            List<string> meal_id = new List<string>();
                                            meal_id.Add(DailyMeal_Item.meal_id);
                                            var s = new Require()
                                            {
                                                dietary_need_id = dn_item.dietary_need_id,
                                                require_name = dn_item.short_name,
                                                count = 1,
                                                meal_id = meal_id
                                            };
                                            l.meal_diet.Add(s);
                                        }
                                    }
                                    #endregion
                                }
                            }
                            #endregion
                            #region 晚餐
                            if (DailyMeal_Item.dinner_state > 0 && dn_item.is_dinner && dinner.isHaveData)
                            {

                                foreach (var d in dinner.dishs)
                                {
                                    //取得菜單元素對應元素
                                    var d_element_id = db0.ConstituteOfElement.Where(x => x.constitute_id == d.constitute_id).Select(x => x.element_id).ToList();
                                    //如果和需求元素對應元素d有重疊
                                    bool check_element_id = db0.DietaryNeedOfElement.Any(x => d_element_id.Contains(x.element_id) && x.dietary_need_id == dn_item.dietary_need_id);
                                    #region 有重疊就加入
                                    if (check_element_id)
                                    {
                                        //檢查此飲食是否在此餐出現過
                                        bool check_d = d.meal_diet.Any(x => x.dietary_need_id == dn_item.dietary_need_id);
                                        if (check_d)
                                        {
                                            var s = d.meal_diet.Where(x => x.dietary_need_id == dn_item.dietary_need_id).FirstOrDefault();
                                            s.count = s.count + 1;
                                            s.meal_id.Add(DailyMeal_Item.meal_id);
                                        }
                                        else
                                        {
                                            List<string> meal_id = new List<string>();
                                            meal_id.Add(DailyMeal_Item.meal_id);
                                            var s = new Require()
                                            {
                                                dietary_need_id = dn_item.dietary_need_id,
                                                require_name = dn_item.short_name,
                                                count = 1,
                                                meal_id = meal_id
                                            };
                                            d.meal_diet.Add(s);
                                        }
                                    }
                                    #endregion
                                }
                            }
                            #endregion
                        }
                        #endregion

                    }
                }

                data.matters = matters;
                data.special_diet = special_diet;
                data.breakfast = breakfast;
                data.lunch = lunch;
                data.dinner = dinner;

                #endregion


                #region Excel Handle

                int detail_row = 8;

                #region 標題
                sheet.Cells[1, 1].Value = "R01每日菜單報表-" + parm.meal_day.ToString("yyyy-MM-dd");
                sheet.Cells[1, 1, 1, 6].Merge = true;
                #region 當日事項
                sheet.Cells[2, 1].Value = "[當日事項]";
                sheet.Cells[2, 1, 2, 6].Merge = true;
                setFontColor_green(sheet, 2, 1);
                setGreenTitle(sheet, 2, 1, 6);
                #endregion
                #region 特殊飲食
                sheet.Cells[7, 1].Value = "[特殊飲食]";
                sheet.Cells[7, 1, 7, 6].Merge = true;
                setFontColor_red(sheet, 7, 1);
                setRedTitle(sheet, 7, 1, 6);
                #endregion
                #endregion

                #region 內容
                #region 當日事項
                #region 停餐
                #region 早
                string p_breakfast = "停早(" + data.matters.pause_meal.breakfast.Count() + "):";
                foreach (var i in data.matters.pause_meal.breakfast)
                {
                    p_breakfast += i + "、";
                }
                sheet.Cells[3, 1].Value = p_breakfast;
                sheet.Cells[3, 1, 3, 2].Merge = true;
                #endregion
                #region 午
                string p_lunch = "停午(" + data.matters.pause_meal.lunch.Count() + "):";
                foreach (var i in data.matters.pause_meal.lunch)
                {
                    p_lunch += i + "、";
                }
                sheet.Cells[3, 3].Value = p_lunch;
                sheet.Cells[3, 3, 3, 4].Merge = true;
                #endregion
                #region 晚
                string p_dinner = "停晚(" + data.matters.pause_meal.dinner.Count() + "):";
                foreach (var i in data.matters.pause_meal.dinner)
                {
                    p_dinner += i + "、";
                }
                sheet.Cells[3, 5].Value = p_dinner;
                sheet.Cells[3, 5, 3, 6].Merge = true;
                #endregion
                #endregion

                #region 開始用餐
                #region 早
                string s_breakfast = "早開始(" + data.matters.start_meal.breakfast.Count() + "):";
                foreach (var i in data.matters.start_meal.breakfast)
                {
                    s_breakfast += i + "、";
                }
                sheet.Cells[4, 1].Value = s_breakfast;
                sheet.Cells[4, 1, 4, 2].Merge = true;
                #endregion
                #region 午
                string s_lunch = "午開始(" + data.matters.start_meal.lunch.Count() + "):";
                foreach (var i in data.matters.start_meal.lunch)
                {
                    s_lunch += i + "、";
                }
                sheet.Cells[4, 3].Value = s_lunch;
                sheet.Cells[4, 3, 4, 4].Merge = true;
                #endregion
                #region 晚
                string s_dinner = "晚開始(" + data.matters.start_meal.dinner.Count() + "):";
                foreach (var i in data.matters.start_meal.dinner)
                {
                    s_dinner += i + "、";
                }
                sheet.Cells[4, 5].Value = s_dinner;
                sheet.Cells[4, 5, 4, 6].Merge = true;
                #endregion
                #endregion

                #region 結束用餐
                #region 早
                string e_breakfast = "早結束(" + data.matters.end_meal.breakfast.Count() + "):";
                foreach (var i in data.matters.end_meal.breakfast)
                {
                    e_breakfast += i + "、";
                }
                sheet.Cells[5, 1].Value = e_breakfast;
                sheet.Cells[5, 1, 5, 2].Merge = true;
                #endregion
                #region 午
                string e_lunch = "午結束(" + data.matters.end_meal.lunch.Count() + "):";
                foreach (var i in data.matters.end_meal.lunch)
                {
                    e_lunch += i + "、";
                }
                sheet.Cells[5, 3].Value = e_lunch;
                sheet.Cells[5, 3, 5, 4].Merge = true;
                #endregion
                #region 晚
                string e_dinner = "晚結束(" + data.matters.end_meal.dinner.Count() + "):";
                foreach (var i in data.matters.end_meal.dinner)
                {
                    e_dinner += i + "、";
                }
                sheet.Cells[5, 5].Value = e_dinner;
                sheet.Cells[5, 5, 5, 6].Merge = true;
                #endregion
                #endregion

                #endregion

                #region 特殊飲食
                foreach (var i in data.special_diet)
                {
                    sheet.Cells[detail_row, 1].Value = i.require_name + "(" + i.count + "):";
                    string tmp = "";
                    foreach (var id in i.meal_id)
                    {
                        tmp += id + "、";
                    }

                    sheet.Cells[detail_row, 2].Value = tmp;
                    sheet.Cells[detail_row, 2, detail_row, 6].Merge = true;
                    detail_row++;
                }
                #endregion

                #region 早餐
                detail_row += 1;
                #region 標題
                sheet.Cells[detail_row, 1].Value = "[早餐]";
                sheet.Cells[detail_row, 1, detail_row, 6].Merge = true;
                setFontColor_orange(sheet, detail_row, 1);
                setYellowTitle(sheet, detail_row, 1, 6);
                #endregion

                detail_row += 1;
                foreach (var i in data.breakfast.dishs)
                {
                    int start = detail_row;
                    sheet.Cells[detail_row, 1].Value = i.dish_name;
                    foreach (var j in i.meal_diet)
                    {
                        sheet.Cells[detail_row, 2].Value = j.require_name + "(" + j.count + "):";
                        string tmp = "";
                        foreach (var id in j.meal_id)
                        {
                            tmp += id + "、";
                        }

                        sheet.Cells[detail_row, 3].Value = tmp;
                        sheet.Cells[detail_row, 3, detail_row, 6].Merge = true;
                        detail_row++;
                    }
                    if (i.meal_diet.Count() == 0)
                    {
                        sheet.Cells[detail_row, 2, detail_row, 6].Merge = true;
                        detail_row++;
                    }
                    else
                    {
                        sheet.Cells[start, 1, detail_row - 1, 1].Merge = true;
                        sheet.Cells[start, 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    }
                }
                if (data.breakfast.dishs.Count() == 0)
                {
                    sheet.Cells[detail_row, 1].Value = "目前暫無排餐!";
                    sheet.Cells[detail_row, 1, detail_row, 6].Merge = true;
                    sheet.Cells[detail_row, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    detail_row++;
                }

                #endregion
                #region 午餐
                detail_row += 1;
                #region 標題
                sheet.Cells[detail_row, 1].Value = "[午餐]";
                sheet.Cells[detail_row, 1, detail_row, 6].Merge = true;
                setFontColor_orange(sheet, detail_row, 1);
                setYellowTitle(sheet, detail_row, 1, 6);
                #endregion

                detail_row += 1;
                foreach (var i in data.lunch.dishs)
                {
                    int start = detail_row;
                    sheet.Cells[detail_row, 1].Value = i.dish_name;
                    foreach (var j in i.meal_diet)
                    {
                        sheet.Cells[detail_row, 2].Value = j.require_name + "(" + j.count + "):";
                        string tmp = "";
                        foreach (var id in j.meal_id)
                        {
                            tmp += id + "、";
                        }

                        sheet.Cells[detail_row, 3].Value = tmp;
                        sheet.Cells[detail_row, 3, detail_row, 6].Merge = true;
                        detail_row++;
                    }

                    if (i.meal_diet.Count() == 0)
                    {
                        sheet.Cells[detail_row, 2, detail_row, 6].Merge = true;
                        detail_row++;
                    }
                    else
                    {
                        sheet.Cells[start, 1, detail_row - 1, 1].Merge = true;
                        sheet.Cells[start, 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    }
                }
                if (data.lunch.dishs.Count() == 0)
                {
                    sheet.Cells[detail_row, 1].Value = "目前暫無排餐!";
                    sheet.Cells[detail_row, 1, detail_row, 6].Merge = true;
                    sheet.Cells[detail_row, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    detail_row++;
                }

                #endregion
                #region 晚餐
                detail_row += 1;
                #region 標題
                sheet.Cells[detail_row, 1].Value = "[晚餐]";
                sheet.Cells[detail_row, 1, detail_row, 6].Merge = true;
                setFontColor_orange(sheet, detail_row, 1);
                setYellowTitle(sheet, detail_row, 1, 6);
                #endregion

                detail_row += 1;
                foreach (var i in data.dinner.dishs)
                {
                    int start = detail_row;
                    sheet.Cells[detail_row, 1].Value = i.dish_name;
                    foreach (var j in i.meal_diet)
                    {
                        sheet.Cells[detail_row, 2].Value = j.require_name + "(" + j.count + "):";
                        string tmp = "";
                        foreach (var id in j.meal_id)
                        {
                            tmp += id + "、";
                        }

                        sheet.Cells[detail_row, 3].Value = tmp;
                        sheet.Cells[detail_row, 3, detail_row, 6].Merge = true;
                        detail_row++;
                    }

                    if (i.meal_diet.Count() == 0)
                    {
                        sheet.Cells[detail_row, 2, detail_row, 6].Merge = true;
                        detail_row++;
                    }
                    else
                    {
                        sheet.Cells[start, 1, detail_row - 1, 1].Merge = true;
                        sheet.Cells[start, 1].Style.VerticalAlignment = ExcelVerticalAlignment.Center;
                    }
                }
                if (data.dinner.dishs.Count() == 0)
                {
                    sheet.Cells[detail_row, 1].Value = "目前暫無排餐!";
                    sheet.Cells[detail_row, 1, detail_row, 6].Merge = true;
                    sheet.Cells[detail_row, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                    detail_row++;
                }

                #endregion
                #endregion

                #region excel排版
                int startColumn = sheet.Dimension.Start.Column;
                int endColumn = sheet.Dimension.End.Column;
                for (int j = startColumn; j <= endColumn; j++)
                {
                    //sheet.Column(j).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;//靠左對齊
                    //sheet.Column(j).Width = 30;//固定寬度寫法
                    sheet.Column(j).AutoFit();//依內容fit寬度
                }//End for
                #endregion
                //sheet.Cells.Calculate(); //要對所以Cell做公計計算 否則樣版中的公式值是不會變的

                #endregion

                string filename = "R01每日菜單報表" + "[" + DateTime.Now.ToString("yyyyMMddHHmm") + "].xlsx";
                excel.Save();
                fs.Position = 0;
                return File(fs, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
            finally
            {
                db0.Dispose();
            }
        }
        public FileResult downloadExcel_ProductRecord(ParmGetProductRecord parm)
        {
            ExcelPackage excel = null;
            MemoryStream fs = null;
            var db0 = getDB0();
            try
            {

                fs = new MemoryStream();
                excel = new ExcelPackage(fs);
                excel.Workbook.Worksheets.Add("ProductRecordData");
                ExcelWorksheet sheet = excel.Workbook.Worksheets["ProductRecordData"];

                sheet.View.TabSelected = true;
                #region 取得產品銷售明細
                string date_range = "(All)";
                var items = from x in db0.RecordDetail
                            orderby x.ProductRecord.record_sn descending
                            select (new R02_RecordDetail()
                            {
                                product_record_id = x.product_record_id,
                                record_deatil_id = x.record_deatil_id,
                                born_id = x.born_id,
                                record_sn = x.ProductRecord.record_sn,
                                customer_name = x.ProductRecord.Customer.customer_name,
                                sell_day = x.sell_day,
                                product_type = x.product_type,
                                product_name = x.product_name,
                                qty = x.qty,
                                price = x.price,
                                subtotal = x.subtotal,
                                user_id = x.i_InsertUserID
                            });

                if (parm.product_type != null)
                {
                    items = items.Where(x => x.product_type == parm.product_type);
                }

                if (parm.product_name != null)
                {
                    items = items.Where(x => x.product_name.Contains(parm.product_name));
                }
                if (parm.word != null)
                {
                    items = items.Where(x => x.record_sn.Contains(parm.word) ||
                                             x.customer_name.Contains(parm.word));
                }

                if (parm.start_date != null && parm.end_date != null)
                {
                    DateTime end = ((DateTime)parm.end_date).AddDays(1);
                    items = items.Where(x => x.sell_day >= parm.start_date && x.sell_day < end);
                    date_range = "(" + ((DateTime)parm.start_date).ToString("yyyy/MM/dd") + "~" + ((DateTime)parm.end_date).ToString("yyyy/MM/dd") + ")";
                }


                var getPrintVal = items.ToList();
                foreach (var item in getPrintVal)
                {
                    string User_Name = db0.AspNetUsers.FirstOrDefault(x => x.Id == item.user_id).user_name_c;
                    item.user_name = User_Name;
                }

                #endregion


                #region Excel Handle

                int detail_row = 3;

                #region 標題
                sheet.Cells[1, 1].Value = "R02產品銷售明細報表" + date_range;
                sheet.Cells[1, 1, 1, 9].Merge = true;
                sheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                sheet.Cells[2, 1].Value = "[銷售單號]";
                sheet.Cells[2, 2].Value = "[銷售日期]";
                sheet.Cells[2, 3].Value = "[客戶名稱]";
                sheet.Cells[2, 4].Value = "[產品分類]";
                sheet.Cells[2, 5].Value = "[產品名稱]";
                sheet.Cells[2, 6].Value = "[數量]";
                sheet.Cells[2, 7].Value = "[售價]";
                sheet.Cells[2, 8].Value = "[小計]";
                sheet.Cells[2, 9].Value = "[經手人]";
                setFontColor_blue(sheet, 2, 1, 9);
                #endregion

                #region 內容
                foreach (var item in getPrintVal)
                {

                    sheet.Cells[detail_row, 1].Value = item.record_sn;
                    sheet.Cells[detail_row, 2].Value = item.sell_day.ToString("yyyy/MM/dd");
                    sheet.Cells[detail_row, 3].Value = item.customer_name;
                    sheet.Cells[detail_row, 4].Value = CodeSheet.GetProductTypeVal(item.product_type);
                    sheet.Cells[detail_row, 5].Value = item.product_name;
                    sheet.Cells[detail_row, 6].Value = item.qty;
                    sheet.Cells[detail_row, 7].Value = item.price;
                    sheet.Cells[detail_row, 8].Value = item.subtotal;
                    sheet.Cells[detail_row, 9].Value = item.user_name;

                    detail_row++;
                }
                #endregion

                #region excel排版
                int startColumn = sheet.Dimension.Start.Column;
                int endColumn = sheet.Dimension.End.Column;
                for (int j = startColumn; j <= endColumn; j++)
                {
                    //sheet.Column(j).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;//靠左對齊
                    //sheet.Column(j).Width = 30;//固定寬度寫法
                    sheet.Column(j).AutoFit();//依內容fit寬度
                }//End for
                #endregion
                //sheet.Cells.Calculate(); //要對所以Cell做公計計算 否則樣版中的公式值是不會變的

                #endregion

                string filename = "R02產品銷售明細報表" + "[" + DateTime.Now.ToString("yyyyMMddHHmm") + "].xlsx";
                excel.Save();
                fs.Position = 0;
                return File(fs, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
            finally
            {
                db0.Dispose();
            }
        }
        public FileResult downloadExcel_AccountsPayable(ParmGetAccountsPayable parm)
        {
            ExcelPackage excel = null;
            MemoryStream fs = null;
            var db0 = getDB0();
            try
            {

                fs = new MemoryStream();
                excel = new ExcelPackage(fs);
                excel.Workbook.Worksheets.Add("AccountsPayableData");
                ExcelWorksheet sheet = excel.Workbook.Worksheets["AccountsPayableData"];

                sheet.View.TabSelected = true;
                #region 取得應收帳款
                string date_range = "(All)";
                var items = from x in db0.AccountsPayable
                            orderby x.record_sn descending
                            select (new R03_AccountsPayable()
                            {
                                product_record_id = x.product_record_id,
                                accounts_payable_id = x.accounts_payable_id,
                                customer_id = x.customer_id,
                                record_sn = x.ProductRecord.record_sn,
                                customer_name = x.Customer.customer_name,
                                record_day = x.ProductRecord.record_day,
                                estimate_payable = x.estimate_payable
                            });

                if (parm.start_date != null && parm.end_date != null)
                {
                    DateTime end = ((DateTime)parm.end_date).AddDays(1);
                    items = items.Where(x => x.record_day >= parm.start_date && x.record_day < end);
                    date_range = "(" + ((DateTime)parm.start_date).ToString("yyyy/MM/dd") + "~" + ((DateTime)parm.end_date).ToString("yyyy/MM/dd") + ")";
                }

                if (parm.word != null)
                {
                    items = items.Where(x => x.record_sn.Contains(parm.word) ||
                                             x.customer_name.Contains(parm.word));
                }


                var getPrintVal = items.ToList();
                foreach (var item in getPrintVal)
                {
                    item.total_money = db0.AccountsPayableDetail.Where(x => x.accounts_payable_id == item.accounts_payable_id).Sum(x => x.actual_receipt);
                }

                #endregion


                #region Excel Handle

                int detail_row = 3;

                #region 標題
                sheet.Cells[1, 1].Value = "R03應收帳款報表" + date_range;
                sheet.Cells[1, 1, 1, 5].Merge = true;
                sheet.Cells[1, 1].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
                sheet.Cells[2, 1].Value = "[來源銷售單號]";
                sheet.Cells[2, 2].Value = "[來源銷售日期]";
                sheet.Cells[2, 3].Value = "[客戶名稱]";
                sheet.Cells[2, 4].Value = "[實際應收金額]";
                sheet.Cells[2, 5].Value = "[實際已收金額]";
                setFontColor_blue(sheet, 2, 1, 5);
                #endregion

                #region 內容
                foreach (var item in getPrintVal)
                {

                    sheet.Cells[detail_row, 1].Value = item.record_sn;
                    sheet.Cells[detail_row, 2].Value = item.record_day.ToString("yyyy/MM/dd");
                    sheet.Cells[detail_row, 3].Value = item.customer_name;
                    sheet.Cells[detail_row, 4].Value = item.estimate_payable;
                    sheet.Cells[detail_row, 5].Value = item.total_money;


                    detail_row++;
                }
                #endregion

                #region excel排版
                int startColumn = sheet.Dimension.Start.Column;
                int endColumn = sheet.Dimension.End.Column;
                for (int j = startColumn; j <= endColumn; j++)
                {
                    //sheet.Column(j).Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;//靠左對齊
                    //sheet.Column(j).Width = 30;//固定寬度寫法
                    sheet.Column(j).AutoFit();//依內容fit寬度
                }//End for
                #endregion
                //sheet.Cells.Calculate(); //要對所以Cell做公計計算 否則樣版中的公式值是不會變的

                #endregion

                string filename = "R03應收帳款報表" + "[" + DateTime.Now.ToString("yyyyMMddHHmm") + "].xlsx";
                excel.Save();
                fs.Position = 0;
                return File(fs, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", filename);
            }
            catch (Exception ex)
            {
                Console.Write(ex.Message);
                return null;
            }
            finally
            {
                db0.Dispose();
            }
        }

        public void setFontColor_green(ExcelWorksheet sheet, int row, int column)
        {
            //文字顏色
            sheet.Cells[row, column].Style.Font.Bold = true;
            sheet.Cells[row, column].Style.Font.Color.SetColor(System.Drawing.Color.Green);
            sheet.Cells[row, column].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        }
        public void setFontColor_red(ExcelWorksheet sheet, int row, int column)
        {
            sheet.Cells[row, column].Style.Font.Bold = true;
            sheet.Cells[row, column].Style.Font.Color.SetColor(System.Drawing.Color.Red);
            sheet.Cells[row, column].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        }
        public void setFontColor_orange(ExcelWorksheet sheet, int row, int column)
        {
            sheet.Cells[row, column].Style.Font.Bold = true;
            sheet.Cells[row, column].Style.Font.Color.SetColor(System.Drawing.Color.Orange);
            sheet.Cells[row, column].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
        }
        public void setGreenTitle(ExcelWorksheet sheet, int row, int start_column, int end_column)
        {
            //左邊線
            sheet.Cells[row, start_column].Style.Border.Left.Style = ExcelBorderStyle.Thick;
            sheet.Cells[row, start_column].Style.Border.Left.Color.SetColor(System.Drawing.Color.Green);
            //右邊線
            sheet.Cells[row, end_column].Style.Border.Right.Style = ExcelBorderStyle.Thick;
            sheet.Cells[row, end_column].Style.Border.Right.Color.SetColor(System.Drawing.Color.Green);
            for (; start_column <= end_column; start_column++)
            {
                //上底線
                sheet.Cells[row, start_column].Style.Border.Top.Style = ExcelBorderStyle.Thick;
                sheet.Cells[row, start_column].Style.Border.Top.Color.SetColor(System.Drawing.Color.Green);
                //下底線
                sheet.Cells[row, start_column].Style.Border.Bottom.Style = ExcelBorderStyle.Thick;
                sheet.Cells[row, start_column].Style.Border.Bottom.Color.SetColor(System.Drawing.Color.Green);
                //背景色
                sheet.Cells[row, start_column].Style.Fill.PatternType = ExcelFillStyle.Solid;
                sheet.Cells[row, start_column].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightGreen);
            }
        }
        public void setRedTitle(ExcelWorksheet sheet, int row, int start_column, int end_column)
        {
            //左邊線
            sheet.Cells[row, start_column].Style.Border.Left.Style = ExcelBorderStyle.Thick;
            sheet.Cells[row, start_column].Style.Border.Left.Color.SetColor(System.Drawing.Color.Red);
            //右邊線
            sheet.Cells[row, end_column].Style.Border.Right.Style = ExcelBorderStyle.Thick;
            sheet.Cells[row, end_column].Style.Border.Right.Color.SetColor(System.Drawing.Color.Red);
            for (; start_column <= end_column; start_column++)
            {
                //上底線
                sheet.Cells[row, start_column].Style.Border.Top.Style = ExcelBorderStyle.Thick;
                sheet.Cells[row, start_column].Style.Border.Top.Color.SetColor(System.Drawing.Color.Red);
                //下底線
                sheet.Cells[row, start_column].Style.Border.Bottom.Style = ExcelBorderStyle.Thick;
                sheet.Cells[row, start_column].Style.Border.Bottom.Color.SetColor(System.Drawing.Color.Red);
                //背景色
                sheet.Cells[row, start_column].Style.Fill.PatternType = ExcelFillStyle.Solid;
                sheet.Cells[row, start_column].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightPink);
            }
        }
        public void setYellowTitle(ExcelWorksheet sheet, int row, int start_column, int end_column)
        {
            //左邊線
            sheet.Cells[row, start_column].Style.Border.Left.Style = ExcelBorderStyle.Thick;
            sheet.Cells[row, start_column].Style.Border.Left.Color.SetColor(System.Drawing.Color.Orange);
            //右邊線
            sheet.Cells[row, end_column].Style.Border.Right.Style = ExcelBorderStyle.Thick;
            sheet.Cells[row, end_column].Style.Border.Right.Color.SetColor(System.Drawing.Color.Orange);
            for (; start_column <= end_column; start_column++)
            {
                //上底線
                sheet.Cells[row, start_column].Style.Border.Top.Style = ExcelBorderStyle.Thick;
                sheet.Cells[row, start_column].Style.Border.Top.Color.SetColor(System.Drawing.Color.Orange);
                //下底線
                sheet.Cells[row, start_column].Style.Border.Bottom.Style = ExcelBorderStyle.Thick;
                sheet.Cells[row, start_column].Style.Border.Bottom.Color.SetColor(System.Drawing.Color.Orange);
                //背景色
                sheet.Cells[row, start_column].Style.Fill.PatternType = ExcelFillStyle.Solid;
                sheet.Cells[row, start_column].Style.Fill.BackgroundColor.SetColor(System.Drawing.Color.LightYellow);
            }
        }

        public void setFontColor_blue(ExcelWorksheet sheet, int row, int start_column, int end_column)
        {
            for (; start_column <= end_column; start_column++)
            {
                sheet.Cells[row, start_column].Style.Font.Bold = true;
                sheet.Cells[row, start_column].Style.Font.Color.SetColor(System.Drawing.Color.Blue);
                sheet.Cells[row, start_column].Style.HorizontalAlignment = ExcelHorizontalAlignment.Center;
            }
        }
        /// <summary>
        /// excel 換行設定 
        /// </summary>
        /// <param name="sheet"></param>
        /// <param name="row"></param>
        /// <param name="start_column"></param>
        /// <param name="end_column"></param>
        public void setWrapText(ExcelWorksheet sheet, int row, int start_column, int end_column)
        {
            for (; start_column <= end_column; start_column++)
            {
                sheet.Cells[row, start_column].Style.WrapText = true;
            }
        }
    }
    public class PQList
    {
        public int p_id { get; set; }
        public decimal qty { get; set; }
    }
    public class SalesList
    {
        public string Name { get; set; }
        public IList<ProductList> items { get; set; }
    }
    public class ProductList
    {
        public int product_id { get; set; }
        public string product_name { get; set; }
        public bool have { get; set; }
        public decimal Sum { get; set; }
    }
}