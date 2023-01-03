const mongoose = require('mongoose')
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')
const Campground = require('../models/campgrounds')

mongoose.connect('mongodb://localhost:27017/yelp-camp')
  .then(() => {
    console.log('Mongo: Connection open');
  })
  .catch(err => {
    console.log('Mongo: Connection error')
    console.log(err)
  })

const sample = array => array[Math.floor(Math.random() * array.length)]

const seedDB = async () => {
  await Campground.deleteMany({})
  for (let i = 0; i < 200; i++) {
    const random1000 = Math.floor(Math.random() * 1000)
    const price = Math.floor(Math.random() * 20) + 10
    const camp = new Campground({
      author: '62802d08d4552fa1bdf7e2e4',
      title: `${sample(descriptors)} ${sample(places)}`,
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
          ]
      },
      images: [
        {
          url: 'https://res.cloudinary.com/deblmn6za/image/upload/v1655318731/YelpCamp/mkuehd933tlq00ggl5hx.jpg',
          filename: 'YelpCamp/mkuehd933tlq00ggl5hx',
        },
        {
          url: 'https://res.cloudinary.com/deblmn6za/image/upload/v1655241738/YelpCamp/csctfqnso3kunxfcodnb.jpg',
          filename: 'YelpCamp/csctfqnso3kunxfcodnb',
        },
        {
          url: 'https://res.cloudinary.com/deblmn6za/image/upload/v1655086012/YelpCamp/kw1roppfq2w9choqzlzk.jpg',
          filename: 'YelpCamp/kw1roppfq2w9choqzlzk',
        }
      ],
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus molestie lacus ut risus pulvinar, a accumsan urna laoreet. Quisque nec tincidunt libero, at porttitor neque. Interdum et malesuada fames ac ante ipsum primis in faucibus. Nam finibus orci nulla, ac sollicitudin sem consectetur vel. Interdum et malesuada fames ac ante ipsum primis in faucibus. Praesent vestibulum mattis dolor. Pellentesque iaculis, nulla quis condimentum bibendum, ante lectus fermentum libero, sed accumsan est mauris sed diam. Maecenas laoreet pharetra lorem vitae ullamcorper. Vivamus at velit metus.',
      price
    })
    await camp.save()
  }
}

seedDB().then(() => mongoose.connection.close())