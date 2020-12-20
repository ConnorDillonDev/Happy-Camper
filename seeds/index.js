const mongoose = require('mongoose')
const Camp = require('../models/camp')
const cities = require('./cities')

const images = require('../seeds/images')
console.log(images)

const {
    places,
    descriptors
} = require('../seeds/seedHelpers')

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/camper'

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind('connection error:'));
db.once('open', () => {
    console.log('Database Connected');
});



const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDB = async () => {
    await Camp.deleteMany({}); //delete everything
    for (let i = 0; i <= 500; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const price = Math.floor(Math.random() * 20) + 10;
        const c = new Camp({
            //MY USER ID FOR ALL SEED CONTROL
            author: '5fdf61f62faae10022f16a44',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            title: `${sample(descriptors)} ${sample(places)}`,
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer sit amet nisl interdum, elementum erat non, gravida nibh.',
            price: price,
            geometry: {
                type: 'Point',
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            images: [{
                    url: images[Math.floor(Math.random() * Math.floor(9))],
                    filename: 'HappyCamper/hximw85cvks8xblnllxy'
                },
                {
                    url: images[Math.floor(Math.random() * Math.floor(9))],
                    filename: 'HappyCamper/v9sprafqyefwvge2vefh'
                },
                {
                    url: images[Math.floor(Math.random() * Math.floor(9))],
                    filename: 'HappyCamper/whmjojtc6s2ellaz9nte'
                }
            ],
        })
        await c.save()
    }

}
seedDB().then(() => {
    mongoose.connection.close()
});