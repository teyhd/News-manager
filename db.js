class dbworker {

  constructor() {
      this.testid = 0
      var mysql      = require('mysql');
      this.mydb = mysql.createConnection({
          host     : 'localhost',
          user     : 'teyhd',
          password : '258000',
          database : 'news',
          charset : 'utf8mb4_general_ci'
        });
  }

  async connect(){
  try {
      await mydb.connect();
      return true;
  } catch (e) {
      return false;
      console.log(e);
  }
}

//mydb.connect()
 selectsql(){
 return this.mydb
}

addpict(newsid,pic){
  let qur = 'INSERT INTO `news`.`pict` (`newsid`,`pict`) VALUES '+`('${newsid}','${pic}');`;
  // console.log(qur);
  this.mydb.query(qur,
  function (error, results, fields) {
      if (error) throw error;
    //  console.log('The solution is: ', results);
    });   
}

  addnews(head,cont,autor,status,mpdate,date,pictures,path){
  let qur = 'INSERT INTO `news`.`news` (`head`,`cont`,`autor`,`status`,`mpdate`,`date`,`path`) VALUES '+`('${head}','${cont}','${autor}',${status},${mpdate},${date},'${path}');`;
  this.mydb.query(qur, function (error, results, fields) {
      if (error) throw error;
        pictures.forEach(element => {
        addpict(results.insertId,element)
      });
      //console.log('The solution is: ', results.insertId);
    });       
}
}
class dbwokerexp{}
dbwokerexp = dbworker
module.exports.dbworker = dbwokerexp
  const dbwoker = new dbworker();
  function addpict(newsid,pic){
    dbwoker.addpict(newsid,pic)
  }