const fs = require('fs');
const cheerio = require('cheerio')
const got = require('got');
const rp = require('request-promise-native');

async function downloadBoxScoreHtml() {
  // where to download the HTML from
  const uri = "https://www.eat-vegan.rocks/en/grated-kohlrabi-salad-with-beetroot-carrot-cucumber-and-sprouts/";
   // the output filename
  const filename = 'friedbroccoli.html';
  // download the HTML from the web server
  console.log(`Downloading HTML from ${uri}...`);
  const results = await rp({ uri: uri });
  // save the HTML to disk
  await fs.promises.writeFile(filename, results);
}
async function parseData(){
    const htmlFile = "friedbroccoli.html";
    const html = await fs.promises.readFile(htmlFile);
    const $ = cheerio.load(html)
    //find the title of the recipie
    const $title = $("h1").text().trim();

    //find the recipie ingradient
    const $trs = $('.ingredient')
    const value = $trs.toArray().map(tr => {
        const tds = $(tr).find('td').toArray();

        const dish =  {};
        for (td of tds){
            const $td = $(td);
            // map the td class attr to its value
            const key = $td.attr('class');
            const value = $td.text();
            dish[key] = value; 
        }

        return dish;
    })

    const values = {
      id: $title,
    }

    //insert into array of obj details about this recipie
    values.obj = value;

    //grab the direction
    const $ul = $('.instructions').toArray().map(li => { 
      const $li = $(li).find("li").toArray();
      const newObj = {};
      for (div of $li){
        const s = $(div).find(".zurreck-recipes-step").text();
        const instruction = $(div).find(".zurreck-recipes-instruction").text();
        const key = s;
        const value = instruction 
        newObj[key] = value
      }
      return newObj;
    })
    
    //insert into the array of obj
    values.ins = $ul;
    
    //write to local storage
    try{
      if(fs.existsSync('data.json')){
        console.log("file exists")
        const dataarray = JSON.parse(fs.readFileSync('data.json'));
        dataarray.push(values);
        await fs.promises.writeFile(
          'data.json',
          JSON.stringify(dataarray, null, 2)
        )
      }
      else{
        console.log("file not exitst")
        await fs.promises.writeFile(
          'data.json',
          JSON.stringify([values], null, 2)
        ).catch(err => console.log(err + " err in writing file"))
      }
    }catch (err){
        console.log(err);
    }

}
async function main() {
  console.log('Starting...');
  await downloadBoxScoreHtml();
  console.log('Done!');
  await parseData();
}
main();