module.exports.dbworker = class dbworker {
  constructor() {
     this.syncSql = require('sync-sql');
      this.sett = {
        host     : 'localhost',
        user     : 'teyhd',
        password : '258000',
        database : 'news',
        charset : 'utf8mb4_general_ci'
      }
    }

  getallnews(){
    let q = `SELECT * FROM news.news;`
    return this.syncSql.mysql(this.sett,q).data.rows;
  }

  getpic(id){
    let q = `SELECT pict FROM news.pict WHERE newsid=${id};`
    return this.syncSql.mysql(this.sett,q).data.rows;
  }

  getnews(id){
    let q = `SELECT * FROM news.news WHERE id=${id};`
    return this.syncSql.mysql(this.sett,q).data.rows[0];
  }

  addpict(newsid,pic){
    let qur = 'INSERT INTO `news`.`pict` (`newsid`,`pict`) VALUES '+`('${newsid}','${pic}');`;
    // console.log(qur);
    let ans = this.syncSql.mysql(this.sett,qur).data;
    return ans;
  }

  dellpict(id,name){
    let qur = `DELETE FROM news.pict WHERE newsid=${id} AND pict='${name}';`;
    // console.log(qur);
    let ans = this.syncSql.mysql(this.sett,qur).data;
    return ans;
  }

  updatenews(id,head,cont,autor,status,mpdate,path){
    let qur = `UPDATE news.news SET head='${head}', cont='${cont}', autor='${autor}' ,status=${status}, mpdate=${mpdate}, path='${path}' WHERE id=${id};`
    let ans = this.syncSql.mysql(this.sett,qur).data;
    return ans;
  }


  addnews(head,cont,autor,status,mpdate,date,pictures,path){
    let qur = 'INSERT INTO `news`.`news` (`head`,`cont`,`autor`,`status`,`mpdate`,`date`,`path`) VALUES '+`('${head}','${cont}','${autor}',${status},${mpdate},${date},'${path}');`;
    let ans = this.syncSql.mysql(this.sett,qur).data;
    pictures.forEach(element => {
      this.addpict(ans.rows.insertId,element)
      });
    return ans.rows.insertId;
  }
}
