// Environment Variables
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

// Libraries
const express = require('express')
const app = express()
const bcrypt = require('bcrypt')
const passport = require('passport')
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

// Database connections
// guest
const accessDB = require('./database/login-database')
// user
const userDB = require('./database/main-database')

// Datatable configs
global.root = ""

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.uid === id)
)

const users = []

app.set('view-engine', 'ejs')
app.use('/public', express.static('public'))
app.use(express.urlencoded({ extended: false }))
app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))

app.get('/', checkAuthenticated, (req, res) => {
    res.redirect('/view-members')
})

app.get('/view-members', checkAuthenticated, async (req, res) =>{

    members = []
    const results = await userDB.promise().query(`select first_name, last_name, date_of_birth, date_of_joining, task
                                                  from Members, Tasks
                                                                    left join Assignments on mid
                                                  where Tasks.tid=Members.tid
                                                  group by date_of_birth, last_name, first_name, date_of_joining, task;`)

    for (const resultsKey in results[0]){
        members.push(results[0][resultsKey])
    }

    res.render('view-members.ejs', members)

})

app.get('/view-assignments', checkAuthenticated, async (req, res) =>{
    assignments = []
    const results = await userDB.promise().query(`SELECT type, date_created, description, CONCAT(street_name, ' ', number, ', ', postcode) as address, COUNT(Members.mid) as count_members
                                                  from Assignments, Members, Location
                                                  where Members.mid = Assignments.mid and
                                                      Location.lid=Assignments.lid
                                                  GROUP BY Assignments.aid;`)

    for (const resultsKey in results[0]){
        assignments.push(results[0][resultsKey])
    }

    res.render('view-assignments.ejs', assignments)
})

app.get('/edit-members', checkAuthenticated, async (req, res) =>{
    tasks = []
    const results = await userDB.promise().query(`SELECT tid, task from Tasks;`)
    for (const resultsKey in results[0]){
        tasks.push(results[0][resultsKey])
    }

    res.render('edit-members.ejs', tasks)
})

app.post('/edit-members', checkAuthenticated,  async (req, res) => {
    const {surname, name, dob, task, doj} = req.body

    result = await userDB.promise().query(`INSERT INTO Members VALUES (null,
                            '${task}',
                            '${name}',
                            '${surname}',
                            DATE('${dob}'),
                            DATE('${doj}')
                            );`)


    res.redirect('/view-members')
})

app.get('/edit-assignments', checkAuthenticated, async (req, res) =>{
    locations = []
    const results = await userDB.promise().query(`SELECT lid, street_name, number, postcode from Location;`)
    for (const resultsKey in results[0]){
        locations.push(results[0][resultsKey])
    }

    members = []
    const memberResults = await userDB.promise().query(`select Members.mid, first_name, last_name, date_of_birth, date_of_joining, task
                                                  from Members, Tasks
                                                                    left join Assignments on mid
                                                  where Tasks.tid=Members.tid
                                                  group by Members.mid, first_name, last_name, first_name, date_of_joining, task;`)

    for (const memberResultsKey in memberResults[0]){
        members.push(memberResults[0][memberResultsKey])
    }


    res.render('edit-assignments.ejs', {locations: locations, members: members})
})

app.post('/edit-assignments', checkAuthenticated, async (req, res) =>{
    const { type, location, members, date, description} = req.body

    console.log(description)

    for (const memKey in members) {
        await userDB.promise().query(`INSERT INTO Assignments VALUES (null,
                            '${location}',
                            '${members[memKey]}',
                            '${type}',
                            DATE('${date}'),
                            '${description}'
                            );`)
    }

    /*

    result = await userDB.promise().query(`INSERT INTO Assignments VALUES (null,
                            '${location}',
                            '${name}',
                            '${surname}',
                            DATE('${dob}'),
                            DATE('${doj}')
                            );`)

    */
    res.redirect('/view-assignments')

})

app.get('/new-task', checkAuthenticated, async (req, res) =>{
    res.render('new-task.ejs')
})

app.post('/new-task', checkAuthenticated, async (req, res) =>{
    const { task } = req.body

    result = await userDB.promise().query(`INSERT INTO Tasks VALUES (null, '${task}')`)
    res.redirect('/edit-members')
})

app.get('/new-location', checkAuthenticated, async (req, res) =>{

    res.render('new-location.ejs')
})

app.post('/new-location', checkAuthenticated, async (req, res) =>{
    const { street, number, postcode } = req.body

    result = await userDB.promise().query(`INSERT INTO Location VALUES (null, '${street}', '${number}', '${postcode}')`)
    res.redirect('/edit-assignments')
})

app.get('/login', checkNotAuthenticated, async (req, res) => {
    res.render('fire-login.ejs')

    const results = await accessDB.promise().query(`SELECT * FROM Users;`)

    for (const resultsKey in results[0]) {
        users.push(results[0][resultsKey])
    }

})

app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, (req, res) => {
    res.render('register.ejs')
})

app.post('/register', checkNotAuthenticated, async (req, res) => {
    try {
        const { email, name, password} = req.body
        hashedPassword = await bcrypt.hash(password, 10)
        if (email && name && password){
            await accessDB.promise().query(`INSERT INTO Users VALUES (null, '${email}', '${name}', '${hashedPassword}');`)
        }
        res.redirect('/login')
    } catch {
        res.redirect('/register')
    }
})

app.get('/logout', (req, res) => {
    req.logOut()
    res.redirect('/login')
})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(3000)