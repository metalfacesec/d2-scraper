const axios = require("axios");
const cheerio = require("cheerio");
const pretty = require("pretty");
const puppeteer = require('puppeteer');

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient()

const url = "https://diablodex.com/Database/Items";

async function getItemData() {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
  
    await page.goto(url);

    let page_content = await page.content();
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

        await createItem(title, '', stats, '', quality, '');
    });
  
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