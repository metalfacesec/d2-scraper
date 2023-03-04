const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
const puppeteer = require('puppeteer');
const fs = require('fs');
const request = require('request');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()

const url = "https://diablodex.com/Database/Items";

const item_types = [
    'Amazon Weapons',
    'Amulets',
    'Axes',
    'Barbarian Helms',
    'Belts',
    'Body Armors',
    'Boots',
    'Bows',
    'Charms',
    'Circlets',
    'Crossbows',
    'Daggers',
    'Druid Pelts',
    'Gloves',
    'Helms',
    'Javelins',
    'Jewels',
    'Katars',
    'Maces',
    'Necromancer Shrunken Heads',
    'Paladin Shields',
    'Polearms',
    'Rings',
    'Scepters',
    'Shields',
    'Sorceress Orbs',
    'Spears',
    'Staffs',
    'Swords',
    'Throwing Weapons',
    'Two-Handed Axes',
    'Two-Handed Maces',
    'Two-Handed Swords',
    'Wands'
]

function download(uri, filename) {
    return new Promise((resolve, reject) => {
        request.head(uri, function(err, res, body){
            if (err) {
                return reject(err);
            }
        
            request(uri).pipe(fs.createWriteStream(filename)).on('close', resolve);
        });
    });
  };

async function getItemData() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    await page.goto(url);

    let page_content = await page.content();

    for (let x = 0; x < item_types.length; x++) {
        const item_type = item_types[x];
        
        const searchResultSelector = `#radioDbItem${x}`;
        await page.$eval(searchResultSelector, form => form.click() );

        page_content = await page.content();

        const $ = cheerio.load(page_content);

        let list = $('.guide-item-wrapper');
        list.each(async (idx, el) => {
            let title = $(el).find('.text-decoration-none.itemcolor-unique').text();
            if (typeof title !== 'string' || !title.trim().length) {
                title = $(el).find('.text-decoration-none.text-white').text();
            }
            if (typeof title !== 'string' || !title.trim().length) {
                title = $(el).find('.text-decoration-none.itemcolor-set').text();
            }

            let image = $(el).find('.guide-image-wrapper').find('img').attr('src');
            let image_name = image.split('/')[image.split('/').length - 1];

            if (!fs.existsSync(`images/${image_name}`)) {
                await download(image, `images/${image_name}`);
            }
            
            let info = $(el).find('.info-wrapper').find('div');
            let stats = [];
            let info_array = [];
            let quality = null;
            info.each((idi, el2) => {
                if ($(el2).attr("class") === 'itemcolor-magic') {
                    stats.push($(el2).text());
                } else if ($(el2).attr("class") === 'mb-2') {
                    quality = $(el2).text();
                } else {
                    info_array.push($(el2).text());
                }
            });

            await createItem(title, item_type, stats, '', quality, image_name);
        });
    }
  
    await browser.close();
}

async function createItem(title, type, stats, rarity, quality, image) {
    await prisma.item.create({
      data: {
        title: title,
        type: type,
        staticStats: stats,
        rarity: rarity,
        quality: quality,
        image: image,
      },
    });
}

async function run() {
    await getItemData();
}

run();