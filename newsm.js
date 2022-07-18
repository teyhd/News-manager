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
        console.log('Создание новости');
    } else {
        const dbworker = new this.db.dbworker(); 
        let results = dbworker.getnews(this.id);
        this.head = results.head
        this.cont = results.cont
        this.autor = results.autor
        this.status = results.status
        this.mpunixtime = results.mpdate
        this.date = results.date
        this.pictures = results.pictures
        this.news_path_n = this.curpath(results.path)
    }
    
    //addnews(head,cont,autor,status,mpdate,date,pictures,path)
   // addpict(newsid,pic)
   } 

   curpath(cpath){
        cpath = cpath.substring(1)
        cpath = cpath.slice(0, cpath.length-1);
        return cpath
   }

    getname(dat,str) {
    dat = dat.split(' ');
  // console.log('dat '+ dat);
    dat = dat.join('.');
    str = str.toLowerCase();
    let arr = str.split(' ');
   // console.log('arr '+ arr);
    let keywords = ['санкт-петербургского','санкт-петербур', 'пансион', 'воспитан','санкт', 'пансио'];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].length==1) {
        //  console.log(arr[i]);
            arr.splice(i, 1);
        }
        keywords.forEach(element => {
        //console.log(element);
                try {
                    let indf = arr[i].indexOf(element)
                    if (indf!=-1) {
                    // console.log("OK" +arr[i] + " " + element); 
                        arr.splice(i, 1);
                    } else {
                    // console.log("NOOK" +arr[i] + " " + element); 
                    // arr.splice(i, i); // начиная с позиции 1, удалить 1 элемент
                    }
                } catch (error) {
                    console.log('Ошибка indexOf 63 newsjs '+arr[i]);
                }
            });
            
    }
    arr.unshift(dat);
    this.newsname= arr.join(' ');
    return this.newsname
    //console.log(arr);
    }

    getdir(mpdate,head){
        return this.pathmod.join(this.news_path,'new',this.getname(mpdate,head))
    }

    getmpunixtime(mpdate){
        let data_arr = mpdate.split(' ');
        let mpunixtime = parseInt((new Date('2022.'+data_arr[1]+'.'+data_arr[0]).getTime() / 1000).toFixed(0))
        if (isNaN(mpunixtime)) {mpunixtime = -1}
        console.log('UNIX время: '+mpunixtime);
        return mpunixtime
    }

    add(head,cont,autor,status,mpdate,pictures){
    let news_path_n = this.getdir(mpdate,head);
    this.fs.ensureDir(news_path_n, { recursive: true })
    this.head = head
    this.cont = cont
    this.autor = autor
    this.status = status
    this.mpunixtime = this.getmpunixtime(mpdate)
    this.pictures = pictures
    console.log('Путь к новости:'+news_path_n);
    this.news_path_n = news_path_n
    this.mpdate = mpdate
    this.save();
    }

    edit(){
        //Удалить фото
        //console.log(this.pictures);


        const dbworker = new this.db.dbworker(); 
        this.pictures.forEach(element => {
            dbworker.addpict(this.id,element)
            });
        this.deldocx(this.news_path_n)
        this.mpunixtime = this.getmpunixtime(this.mpdate)
        dbworker.updatenews(this.id,this.head,this.cont,this.autor,this.mpunixtime,this.news_path_n)

    }

    renamefolder(){
        const dbworker = new this.db.dbworker(); 
        console.log('Старая папка из бд: ' + JSON.parse(this.news_path_n));
        this.fs.renameSync(JSON.parse(this.news_path_n),this.pathmod.join(this.news_path,'new',this.newsname))
        console.log('Новое имя: '+this.pathmod.join(this.news_path,'new',this.newsname));
        this.news_path_n = JSON.stringify(this.pathmod.join(this.news_path,'new',this.newsname));
        dbworker.updatefolder(this.id,this.news_path_n)
    }

    delpicture(picfordel){
        const dbworker = new this.db.dbworker(); 
        picfordel=picfordel.split(',');
        console.log('Имена фоток для удаления из формы:'+picfordel);
        picfordel.forEach(element => {
            element = element.split('/');
            element = element[element.length-1]
            console.log(element);
            if (element!='') {
                console.log('Удаляю: '+this.pathmod.join(this.news_path_n,element));
                let does = this.fs.removeSync(this.pathmod.join(this.news_path_n,element))
                dbworker.dellpict(this.id,element);
                console.log('Файл удален: '+element);
            }
        });
        

    }

    save(par){
    const dbworker = new this.db.dbworker();  
    const doxworker = new this.dox.doxwork();

    try {
        this.news_path_n = JSON.stringify(this.news_path_n)
        this.getname(this.mpdate,this.head)
        //this.renamefolder()
        console.log('Сохрнаить?'+par);
        if (par!=undefined) {
            this.renamefolder()
           // this.news_path_n = JSON.stringify(this.news_path_n)
            this.getname(this.mpdate,this.head)
            this.edit()
        } else {
            dbworker.addnews(this.head,this.cont,this.autor,this.status,this.mpunixtime,this.unixTime(new Date()),this.pictures,this.news_path_n);  
            }
            doxworker.addnews(this.newsname, this.head, this.cont ,this.news_path_n); //Заменить первое на имя документа
            console.log('Название:'+this.newsname);
    } catch (err) {
        console.log('Ошибка 144 строка: '+err);
        return false;
        }
        
        return true;
    }
    deldocx(dirpath) {

        dirpath = this.curpath(dirpath)
        let files = this.fs.readdirSync(dirpath)
        console.log('Файлы в диерктории удаления:'+files);
        files.forEach(files => {
            let arr = files.split('.');
            if (arr[arr.length-1]=='docx'){
                let does = this.fs.removeSync(this.pathmod.join(dirpath,files)) 
                console.log(does+' Фалы удалены: '+files);
            }
        });
    }
    getdbfolder(){
        let foldern = this.news_path_n.split('\\');
       // foldern = foldern[foldern.length-1];
        console.log(foldern);
        foldern = this.pathmod.join(this.news_path,'new',foldern)
        return foldern;
    }
}
const { dbworker } = require('./db.js');
const newsclv = require('./newsm.js');
async function get() {
     let test = new newsclv.newscl(199);
     // console.log(test.news_path_n);
     // console.log(test.head);
}

