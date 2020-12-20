if(process.env.NODE_ENV !== 'production'){
    require('dotenv').config()
}

const express = require('express')
const path = require('path');
const mongoose = require('mongoose')
const session = require('express-session')
const mongoSanitize = require('express-mongo-sanitize')
const helmet = require("helmet");
const morgan = require('morgan')
const engine = require('ejs-mate')
const methodOverride = require('method-override') //form actions
const flash = require('connect-flash')
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User = require('./models/user')



const ExpressError = require('./utils/ExpressError')

const userRoutes = require('./routes/users')
const campgroundRoutes = require('./routes/campgrounds')
const reviewRoutes = require('./routes/reviews');
const MongoStore  = require('connect-mongo')(session);


//const dbUrl = process.env.DB_URL
// const dbUrl = 'mongodb://localhost:27017/camper'

const dbUrl = process.env.DB_URL || 'mongodb://localhost:27017/camper'

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify:true
});

//connects to database
const db = mongoose.connection;
db.on('error', console.error.bind('connection error:'));
db.once('open', () => {
    console.log('Database Connected');
});

const app = express()

app.engine('ejs', engine)//set engine
app.set('view engine', 'ejs'); //settings engine to ejs
app.set('views', path.join(__dirname, 'views')) //serving views


//always used req
app.use(express.urlencoded({extended: true})) //parse req.body
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public'))) //serve public folder
app.use(morgan('tiny'))
app.use(mongoSanitize());


const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://api.tiles.mapbox.com/",
    "https://api.mapbox.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net",
    'https://code.jquery.com/jquery-3.5.1.min.js',
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://api.mapbox.com/",
    "https://api.tiles.mapbox.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
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
                "https://res.cloudinary.com/dfy12rpmk/",
                "https://images.unsplash.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

const secret = process.env.SECRET || 'development'

const store = new MongoStore({
    url: dbUrl,
    secret,
    touchAfter: 24 * 60 * 60
})

store.on('error', (e)=>{
    console.log('session store error', e)
})

const sessionConfig = {
    store: store,
    secret,
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly:true,
        // secure:true, https only
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, //ms mins hours day week
        maxAge: 1000 * 60 * 60 * 24 * 7
    }
}

app.use(flash());
app.use(session(sessionConfig));

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser())


//flash middleware before all routes to allow access to the success key flash
app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

//route handlers
app.use('/campgrounds', campgroundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes) //added {mergeParams:true} to reviews express in order to access the :id in routes
app.use('/', userRoutes)


//root
app.get('/', (req, res) => {
    res.render('home')
})

// app.get('/fakeuser', async(req, res)=>{
//     const user = new User({email:'test123@gmail.com', username:'connor'})
//     const newUser = await User.register(user, 'thisisasuperpassword');
//     res.send(newUser);
// })

// for all paths
// will only run if all of above are not met
// app.all('*', (req, res, next) => {
//     next(new ExpressError('error',404)) //passed below
// })

//error handle this is (NEXT)
app.use((err, req, res, next) => {
    if (!err.message) err.message = 'Something went wrong';
    console.log(err);
    const {statusCode = 500} = err;
    res.status(statusCode).render('error', {err}); //render our error.ejs file
})

//running on 3000
const port = process.env.PORT || 3000
app.listen(port, () => {
    console.log(`serving on port ${port}`)
})