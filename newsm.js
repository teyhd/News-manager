module.exports.newscl = class newscl{

   constructor (id){
    this.id = id
    this.news_path = 'F:/news/public/news';
    this.db = require('./db.js');
    this.dox = require('./dox.js');

    this.fs = require('fs-extra');   
    this.pathmod = require('path');
    this.unixTime = require('unix-time');
    if (this.id==undefined) {
        this.head
        this.cont
        this.autor
        this.status
        this.mpdate
        this.date
        this.pictures
        this.path
    } else {
        dbworker.selectsql().query(`SELECT * FROM news.news WHERE id=${id};`,function (error, results, fields) {
            results = results[0]
            //  console.log(results);
              if (error) throw error;
              if (results==undefined) {
                this.head = results.head
                this.cont = results.cont
                this.autor = results.autor
                this.status = results.status
                this.mpdate = results.mpdate
                this.date = results.date
                this.pictures = results.pictures
                this.path = results.path
              }
        })         
    }
    
    //addnews(head,cont,autor,status,mpdate,date,pictures,path)
   // addpict(newsid,pic)
   } 


    getname(dat,str) {
    dat = dat.split(' ');
    dat = dat.join('.');
    str = str.toLowerCase();
    let arr = str.split(' ');
    let keywords = ['санкт-петербургского','санкт-петербур', 'пансион', 'воспитан','санкт', 'пансио'];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].length==1) {
        //  console.log(arr[i]);
            arr.splice(i, 1);
        }
        keywords.forEach(element => {
        //console.log(element);
            let indf = arr[i].indexOf(element)
            if (indf!=-1) {
            // console.log("OK" +arr[i] + " " + element); 
                arr.splice(i, 1);
            } else {
            // console.log("NOOK" +arr[i] + " " + element); 
            // arr.splice(i, i); // начиная с позиции 1, удалить 1 элемент
            }
            });
            
    }
    arr.unshift(dat);
    return arr.join(' ');
    //console.log(arr);
    }

    getdir(mpdate,head){
        return this.pathmod.join(this.news_path,'new',this.getname(mpdate,head))
    }

    add(head,cont,autor,status,mpdate,pictures){
    const doxworker = new this.dox.doxwork();
    let data_arr = mpdate.split(' ');
    let mpunixtime = parseInt((new Date('2022.'+data_arr[1]+'.'+data_arr[0]).getTime() / 1000).toFixed(0))
    if (isNaN(mpunixtime)) {mpunixtime = -2}
    console.log(mpunixtime);
    let news_path_n = this.getdir(mpdate,head);
    this.fs.ensureDir(news_path_n, { recursive: true })
    //dbworker.addnews(head,cont,autor,status,mpdate,date,pictures,path)
    const dbworker = new this.db.dbworker();  
    try {
        dbworker.addnews(head,cont,autor,status,mpunixtime,this.unixTime(new Date()),pictures,JSON.stringify(news_path_n));
        doxworker.addnews(this.getname(mpdate,head), head, cont ,news_path_n); //Заменить первое на имя документа
    } catch (err) {
        console.log('DATABASE '+err);
        return false;
        }
        return true;
    }

}
const newsclv = require('./newsm.js');
let test = new newsclv.newscl();
//test.add('5sdf','sdf','sdf',0,"07 07",['sd','sdf']);
//test.add('5sdf','sdf','sdf',0,"07 07",['sd','sdf']);

