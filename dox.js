module.exports.doxwork = class doxwork {

    constructor() {
        this.news_path = 'F:/news/public/news'; // Передавать
        const officegen = require('officegen')
        this.fs = require('fs')
        this.path = require('path');
        // Create an empty Word object:
        this.docx = officegen('docx')
    }

    addnews(fname,head,cont,path){
        //this.docx = officegen('docx')
        // Officegen calling this function after finishing to generate the docx document:
        this.docx.on('finalize', function(written) {
        console.log(
            'Finish to create a Microsoft Word document.'
        )
        })

        // Officegen calling this function to report errors:
        this.docx.on('error', function(err) {
        console.log(err)
        })
        let pObj = this.docx.createP()
        pObj.addText(head);
        pObj = this.docx.createP()
        pObj.addText(cont);
        let out = this.fs.createWriteStream(this.path.join(path,fname+'.docx'))
        out.on('error', function(err) {
        console.log(err)
        })
        this.docx.generate(out)
    }

    createdox(){
   let pObj = this.docx.createP()
   
    pObj.addText("sfsd")
    pObj.addText(' with color', { color: '000088' })
    pObj.addText(' and back color.', { color: '00ffff', back: '000088' })

    pObj = this.docx.createP()

    pObj.addText('Since ')
    pObj.addText('officegen 0.2.12', {
    back: '00ffff',
    shdType: 'pct12',
    shdColor: 'ff0000'
    }) // Use pattern in the background.
    pObj.addText(' you can do ')
    pObj.addText('more cool ', { highlight: true }) // Highlight!
    pObj.addText('stuff!', { highlight: 'darkGreen' }) // Different highlight color.

    pObj = this.docx.createP()

    pObj.addText('Even add ')
    pObj.addText('external link', { link: 'https://github.com' })
    pObj.addText('!')

    pObj = this.docx.createP()

    pObj.addText('Bold + underline', { bold: true, underline: true })

    pObj = this.docx.createP({ align: 'center' })

    pObj.addText('Center this text', {
    border: 'dotted',
    borderSize: 12,
    borderColor: '88CCFF'
    })

    pObj = this.docx.createP()
    pObj.options.align = 'right'

    pObj.addText('Align this text to the right.')

    pObj = this.docx.createP()

    pObj.addText('Those two lines are in the same paragraph,')
    pObj.addLineBreak()
    pObj.addText('but they are separated by a line break.')

    this.docx.putPageBreak() //Разрыв

    pObj = this.docx.createP()

    pObj.addText('Fonts face only.', { font_face: 'Arial' })
    pObj.addText(' Fonts face and size.', { font_face: 'Arial', font_size: 40 })

    this.docx.putPageBreak()

    pObj = this.docx.createP()

    // We can even add images:
    //pObj.addImage('some-image.png')

    // Let's generate the Word document into a file:

    let out = this.fs.createWriteStream(this.path.join(this.news_path,'example.docx'))

    out.on('error', function(err) {
    console.log(err)
    })

    // Async call to generate the output file:
    this.docx.generate(out)


        }





}