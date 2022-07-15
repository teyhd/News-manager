process.on('uncaughtException', (err) => {
  console.log('Глобальный косяк приложения!!! ', err.stack);
}); //Если все пошло по пизде, спасет ситуацию
const news_path = 'F:/news/public/news';
const express = require('express');
const exphbs = require('express-handlebars');
const fileUpload = require('express-fileupload');
const session = require('express-session');
var cookieParser = require('cookie-parser');
var unixTime = require('unix-time');
const path = require('path');
const fs = require('fs-extra');

const test = require('./test.js');

const dox = require('./dox.js');
const doxworker = new dox.doxwork();

const db = require('./db.js');
const dbworker = new db.dbworker();

const ortog = require('./orthog.js');

const PORT = process.env.PORT || 3000;
const app = express();
const hbs = exphbs.create({
defaultLayout: 'main',
extname: 'hbs'
});

app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views','views');
app.use(express.static(path.join(__dirname, 'public')));
app.use(cookieParser());
app.use(fileUpload());
app.use(session({resave:false,saveUninitialized:false, secret: 'keyboard cat', cookie: { maxAge: 60000 }}))

app.get('/',(req,res)=>{
  console.log(req.socket.remoteAddress);

  //console.log(dbworker.selectsql(res));
let auth = isAuth(req);
//console.log('Cookies: ', req.cookies)
//console.log('Signed Cookies: ', req.signedCookies)
dbworker.selectsql().query('SELECT * FROM news.news;',function (error, results, fields) {
  if (error) throw error;
  results.forEach(element => {
    if (element.comment == null) {//
      element.comment = 'Замечаний нет';
    }
    element.status = getstatus(element.status)
  let datecreate = new Date(element.date*1000);
  let datemp = new Date(element.mpdate*1000);
  element.date = `${curdate(datecreate.getDate())}.${curdate(datecreate.getMonth()+1)} ${curdate(datecreate.getHours())}:${curdate(datecreate.getMinutes())}:${curdate(datecreate.getSeconds())}`;
  element.mpdate = `${curdate(datemp.getDate())}.${curdate(datemp.getMonth()+1)}`
});
  res.render('index',{
    title: 'Создание новости',
    auth: auth,
    content: results     
  });
//  console.log('The solution is: ', results);
});

})
app.get('/new',(req,res)=>{
let auth = isAuth(req);
  res.render('new',{
    title: 'Создание новости',
    auth: auth      
  });
})
app.get('/check',(req,res)=>{
 ortog.test(res,req.query.text)
//console.log(result);
/*if (typeof result != "undefined"){
  res.send({"result":req.query.text});
} else res.send({"result":"ok"});*/
})
app.get('/edit',(req,res)=>{
 let auth = isAuth(req);
 console.log('ID редактируемой страницы:  '+req.query.idn);

 dbworker.selectsql().query(`SELECT * FROM news.news WHERE id=${req.query.idn};`,function (error, results, fields) {
  results = results[0]
//  console.log(results);
  if (error) throw error;
  if (results==undefined) {
    res.render('404',{
      title: 'Новости с таким ID нет',
      auth: auth,
    });
    return 0;
  } else {
    results.path = results.path.substring(15)
    results.path = results.path.slice(0, -1)
    dbworker.selectsql().query(`SELECT pict FROM news.pict WHERE newsid=${req.query.idn};`,function (error, resuls, fields) {
      //console.log(resuls);
      //results.pictures = 'JSON.parse(results.pictures)'
      results.pictures = resuls
      for (let j = 0; j < results.pictures.length; j++) {
        results.pictures[j] = `${results.path}/${results.pictures[j].pict}` ;
     }
    })
    //console.log( results.pictures);
    let datecreate = new Date(results.date*1000);
    let datemp = new Date(results.mpdate*1000);
    results.date = `${curdate(datecreate.getDate())}.${curdate(datecreate.getMonth()+1)} ${curdate(datecreate.getHours())}:${curdate(datecreate.getMinutes())}:${curdate(datecreate.getSeconds())}`;
    results.mpdate = `${curdate(datemp.getDate())}.${curdate(datemp.getMonth()+1)}`
  
    res.render('edit',{
      title: 'Редактирование новости',
      auth: auth,
      content: results,
      path : results.path     
    });
  //  console.log('The solution is: ', results);
  }

});
})
app.get('/auth', function(req, res) {
  console.log(req.query.pass);
  if (req.query.pass){
    if (req.query.pass == '159'){
      req.session.auth = true;
      res.send('ok');
      return true;
    }
  }
  req.session.auth = false;
  res.send('nok');
})
app.get('/logout', function(req, res) {
console.log("Пользователь вышел");
req.session.auth = false;
res.send('ok');
})
app.post('/upload', function(req, res) {
if (!req.files || Object.keys(req.files).length === 0) {
  return res.status(400).send('Произошла ошибка! Обратитесь к разработчику!');
}
let pictures_name =[];
//Дата мероприятия в уникс тайм
let data_arr = req.body.new_date.split(' ');
let mpunixtime = parseInt((new Date('2022.'+data_arr[1]+'.'+data_arr[0]).getTime() / 1000).toFixed(0))
console.log(mpunixtime);
let news_npath = path.join(news_path,'new',getname(req.body.new_date,req.body.new_head))
fs.mkdirSync(news_npath, { recursive: true })
//await fs.promises.mkdir(news_npath, { recursive: true })
//namew,head,cont
//doxworker.addnews(req.body.new_head, req.body.new_head, req.body.new_text ,news_npath); //Заменить первое на имя документа
//adddir(req.files.mainpic.name);
//console.log(req.body.new_text)

let main_pic = req.files.mainpic
pictures_name.push(path.join("Заставка "+main_pic.name))
main_pic.mv(path.join(news_npath,"Заставка "+main_pic.name), function(err) {
  if (err)
    return res.status(500).send(err); 
});
let photos = req.files.newsimg;
try {
    if (typeof photos.length != "undefined"){
      photos.forEach(element => {
        //console.log(element);
        pictures_name.push(path.join(element.name))
        element.mv(path.join(news_npath,element.name), function(err) {
          if (err)
            return res.status(500).send(err); 
        });
      });
    } else{
        photos.mv(path.join(news_npath,photos.name), function(err) {
          pictures_name.push(path.join(photos.name))
          if (err)
            return res.status(500).send(err);            
        });
    } 
} catch (error) {
  console.log('Закрыть дыру с отправкой любыйх файлов');
}

dbworker.addnews(req.body.new_head, req.body.new_text,req.body.new_auth,0,mpunixtime,unixTime(new Date()),pictures_name,JSON.stringify(news_npath));
//console.log(main_pic.mimetype); //Переадресация на главную
//res.render('index',{title: 'Главная'});
res.redirect('/');
});
app.post('/edit', function(req, res) {
  console.log(req.query.idn); // ID database update
  let pictures_name =[];
  //Дата мероприятия в уникс тайм
  let data_arr = req.body.new_date.split(' ');
  let mpunixtime = parseInt((new Date('2022.'+data_arr[1]+'.'+data_arr[0]).getTime() / 1000).toFixed(0))
  console.log(req.body);
  let news_npath = path.join(news_path,'new',getname(req.body.new_date,req.body.new_head))
  //fs.mkdirSync(news_npath, { recursive: true })

  let main_pic = req.files.mainpic
  pictures_name.push(path.join("Заставка "+main_pic.name))
  main_pic.mv(path.join(news_npath,"Заставка "+main_pic.name), function(err) {
    if (err)
      return res.status(500).send(err); 
  });
  let photos = req.files.newsimg;
  try {
      if (typeof photos.length != "undefined"){
        photos.forEach(element => {
          //console.log(element);
          pictures_name.push(path.join(element.name))
          element.mv(path.join(news_npath,element.name), function(err) {
            if (err)
              return res.status(500).send(err); 
          });
        });
      } else{
          photos.mv(path.join(news_npath,photos.name), function(err) {
            pictures_name.push(path.join(photos.name))
            if (err)
              return res.status(500).send(err);            
          });
      } 
  } catch (error) {
    console.log('Закрыть дыру с отправкой любыйх файлов');
  }
  
 // dbworker.addnews(req.body.new_head, req.body.new_text,req.body.new_auth,0,mpunixtime,unixTime(new Date()),pictures_name,JSON.stringify(news_npath));
 // console.log(main_pic.mimetype); 
  //res.render('index',{title: 'Главная'});
  
  res.redirect('/');
})
function adddir(name){
let basedir = __dirname;
console.log(path.join(basedir,name));
fs.ensureDirSync(path.join(basedir,name));
}
function isAuth(req){
if (req.session.auth){
  return req.session.auth;
} else 
  return false;
}
function curdate(minute){
  minute = (minute < 10) ? '0' + minute : minute;
  return minute;
}
function getname(dat,str) {
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
function getstatus(num) {
  let ans = [
    'Ожидает утверждения',
    'Требует исправления!',
    'Утверждено! Ожидает отправку',
    'Отправлено',
    'На сайте',
    'На сайте! ОШИБКА в содержании!!!'
  ]
  return ans[num]
}
async function start(){
    try {
        await dbworker.connect();
        app.listen(PORT,()=> {
          console.log('Сервер менеджера новостей - запущен')
          dbworker.selectsql();
        })
    } catch (e) {
        console.log(e);
    }
}

start();