if (process.env.NODE_ENV != "production") {
    require('dotenv').config()
}

console.log(process.env.SECRET)


const express = require('express')
const session = require('express-session')
const app = express()
const path = require('path')
const mongoose = require('mongoose')
const ejsMate = require('ejs-mate')
const { campgroundSchema, reviewSchema } = require('./schemas')
const catchAsync = require('./utils/catchAsync')
const ExpressError = require('./utils/ExpressError')
const flash = require('connect-flash')

const methodOverride = require('method-override')
const Campground = require('./models/campgrounds')
const { wrap } = require('module')
const { join } = require('path')
const Review = require('./models/reviews')

const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')
const helmet = require('helmet')

const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews')
const userRoutes = require('./routes/users')

const mongoSanitize = require('express-mongo-sanitize')
const MongoDBStore = require('connect-mongo')
const MongoStore = require('connect-mongo')

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp'
const dbUrlMongo = 'mongodb://localhost:27017/yelp-camp'

mongoose.connect(dbUrl)
    .then(() => {
        console.log('Mongo: Connection open');
    })
    .catch(err => {
        console.log('Mongo: Connection error')
        console.log(err)
    })

app.engine('ejs', ejsMate)
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }))
app.use(methodOverride("_method"))
app.use(express.static(path.join(__dirname, 'public')))

app.use(mongoSanitize())


// session
const secret = process.env.SECRET || 'secret'

const store = MongoDBStore.create({
    mongoUrl: dbUrl,
    crypto: {
        secret: secret,
    },
    touchAfter: 24 * 60 * 60
})

store.on('error', function (e) {
    console.log('SESSION STORE ERROR', e)
})

const sessionConfig = {
    store,
    name: 'YelpCampSession',
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}
app.use(session(sessionConfig))
app.use(flash())
// app.use(helmet( {crossOriginEmbedderPolicy: false} ))

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net",
];
const connectSrcUrls = [
    "https://api.mapbox.com/",
    "https://a.tiles.mapbox.com/",
    "https://b.tiles.mapbox.com/",
    "https://events.mapbox.com/",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/deblmn6za/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT! 
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);


// Passport authentication 
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

// Passport user creation demo
// app.get('/fakeUser', async (req, res) =>{
//     const user = new User({email: 'pw@gma.com', username: 'theman'})
//     const newUser = await User.register(user, 'chicken')
//     res.send(newUser)
// })



// flash middleware

app.use((req, res, next) => {
    res.locals.currentUser = req.user
    res.locals.success = req.flash('success')
    res.locals.error = req.flash('error')
    next()
})

// homepage
app.get('/', (req, res) => {
    res.render('home')
})

// Router to users

app.use('/', userRoutes)

// Router to campgrounds

app.use('/campgrounds', campgroundRoutes)


// Router to reviews in a campground

app.use('/campgrounds/:id/reviews', reviewRoutes)

// 404

app.all('*', (req, res, next) => {
    next(new ExpressError('404 not found', 404))
})

app.use((err, req, res, next) => {
    const { statusCode = 500 } = err
    if (!err.message) err.message = 'Default error'
    res.status(statusCode).render('error', { err })
})

const port = process.env.PORT || 3000

app.listen(port, () => {
    console.log(`Serving on port ${port}`)
})