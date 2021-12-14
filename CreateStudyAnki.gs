function CreateStudyAnki() {
  // Read sheet
  var active_sheet = SpreadsheetApp.getActiveSheet();
  var rows = active_sheet.getRange("A2:F" + active_sheet.getLastRow()).getValues();
  var i = 0;
  var prev_group       = "";
  var prev_subgroup    = "";
  var prev_question    = "";
  var prev_subquestion = "";
  var prev_answer      = "";
  var prev_subanswer   = "";

  var data_group       = [];
  var data_subgroup    = [];
  var data_question    = [];
  var data_subquestion = [];
  var data_answer      = [];
  var data_subanswer   = [];

  while(i < rows.length){
    //console.log("row:", rows[i]);
    if (rows[i].join() != ""){
      var curr_group       = rows[i][0];
      var curr_subgroup    = rows[i][1];
      var curr_question    = rows[i][2];
      var curr_subquestion = rows[i][3];
      var curr_answer      = rows[i][4];
      var curr_subanswer   = rows[i][5];

      if(curr_answer != ""){
        if(prev_answer != ""){
          data_answer.push({"answer":prev_answer, "subanswer": data_subanswer.slice()});
        }
        prev_answer = curr_answer;
        data_subanswer = [];
      }
      if(curr_subquestion != "" || i+1 == rows.length){
        if(prev_subquestion != ""){
          data_subquestion.push({"subquestion":prev_subquestion, "answer": data_answer.slice()});
        }
        prev_subquestion = curr_subquestion;
        data_answer = [];
      }
      if(curr_question != "" || i+1 == rows.length){
        if(prev_question != ""){
          data_question.push({"question":prev_question, "subquestion": data_subquestion.slice()});
        }
        prev_question = curr_question;
        data_subquestion = [];
      }
      if(curr_subgroup != "" || i+1 == rows.length){
        if(prev_subgroup != ""){
          data_subgroup.push({"subgroup":prev_subgroup, "question": data_question.slice()});
        }
        prev_subgroup = curr_subgroup;
        data_question = [];
      }
      if(curr_group != "" || i+1 == rows.length){
        if(prev_group != ""){
          data_group.push({"group":prev_group, "subgroup": data_subgroup.slice()});
        }
        prev_group = curr_group;
        data_subgroup = [];
      }
      if(curr_subanswer != ""){
        data_subanswer.push(curr_subanswer);
      }
    }
    i++;
  }
  Logger.log(data_group[0]["subgroup"][0]["question"][0]["subquestion"][0]);
  Logger.log(data_group[0]["subgroup"][0]["question"][0]["subquestion"][1]);
  //Logger.log(data_group[0]["subgroup"][0]["question"][1]["subquestion"][0]["answer"][0]);
  //Logger.log(data_group[0]["subgroup"][0]["question"][1]["subquestion"][0]["answer"][1]);
  // Create 4 columns for anki format: [front, back, tags, notes]
  var qpairs = [];
  var row_head_q1 = 
    "<th>فصل</th> </tr> <tr>";
  var row_head_q2 = 
    "<th>فصل</th> <th>المسألة</th> </tr> <tr>";
  var row_head_q3 = 
    "<th>فصل</th> <th>المسألة</th> <th>تفريع</th>  </tr> <tr>";
  var row_head_q4 = 
    "<th>فصل</th> <th>المسألة</th> <th>تفريع</th> <th>جواب</th> </tr> <tr>";
  var table_head = '"<table> <tr>';
  var table_foot = '</tr> </table>"';
  // Question type 1, مسائل_الباب# 
  for(var g = 0; g < data_group.length; g++){
    var group = data_group[g];
    for(var sg = 0; sg < group["subgroup"].length; sg++){
      var subgroup = group["subgroup"][sg];
      var tags = group["group"] + " , " + subgroup["subgroup"]
      tags = tags.replace(" ","_")
      var q1_tags = '"'+tags + ' , #مسائل_الباب"';
      var prefix1 = "<td>"+subgroup["subgroup"]+"</td>";
      qpairs.push([table_head + row_head_q1 + prefix1 + table_foot, 
                   table_head+"<td>"+subgroup["question"].map(x=>x["question"]).join("</td></tr><tr><td>")+"</td>"+table_foot,
                   q1_tags]);
      for(var q = 0; q < subgroup["question"].length; q++){
        var question = subgroup["question"][q];
        var q2_tags = '"'+tags + ' , #مسألة_تفريع"';
        var prefix2 = prefix1+"<td>"+question["question"]+"</td>";
        qpairs.push([table_head + row_head_q2 + prefix2 + table_foot, 
                     table_head+"<td>"+question["subquestion"].map(x=>x["subquestion"]).join("</td></tr><tr><td>")+"</td>"+table_foot, 
                     q2_tags]);
        for(var sq = 0; sq < question["subquestion"].length; sq++){
          var subquestion = question["subquestion"][sq];
          var q3_tags = '"' + tags + ' , #تفريع_جواب"';
          var prefix3 = prefix2+"<td>"+subquestion["subquestion"]+"</td>";
          qpairs.push([table_head + row_head_q3 + prefix3 + table_foot, 
                       table_head+"<td>"+subquestion["answer"].map(x=>x["answer"]).join("</td></tr><tr><td>")+"</td>"+table_foot,
                       q3_tags]);
          for(var a = 0; a < subquestion["answer"].length; a++){
            var answer = subquestion["answer"][a];
            var q4_tags = '"' + tags+ ' , #جواب_تفصيل"';
            var prefix4 = prefix3+"<td>"+answer["answer"]+"</td>";
            if(answer["subanswer"].length > 0){
              //Logger.log(answer);
              qpairs.push([table_head + row_head_q4 + prefix4 + table_foot, 
              table_head+"<td>"+answer["subanswer"].join("</td></tr><tr><td>")+"</td>"+table_foot,
              q4_tags]);
            }
          }
        }
      }
    }
  }
  var q =0;
  Logger.log(qpairs[q][0]);
  Logger.log(qpairs[q][1]);
  Logger.log(qpairs[q][2]);
  /// capture last question, all new rows are part of one answer
  //Create a new sheet
  DriveApp.createFile("mycsv.csv", qpairs.join("\n"));
  
}
