const User = require('../models/user'); 



module.exports.renderRegister = (req, res)=>{
    res.render('users/register')
}

module.exports.registerSaveToDB = async(req, res)=>{
    try{
        const {email, username, password } = req.body
        const newUser = await new User({email, username})
        const registeredUser = await User.register(newUser, password);
        req.login(registeredUser, err=>{});
        req.flash('success', 'Welcome '+ username)
        res.redirect('/campgrounds')
    }catch(e){
        req.flash('error', e.message)
        res.redirect('/register')
    }
}

module.exports.renderLogin = async(req,res)=>{
    res.render('users/login')
}

module.exports.login =(req,res)=>{
    const {username} = req.body
    if(!req.session.returnTo){
        res.redirect('campgrounds');
        req.flash('success', `Welcome back, ${username}!`)
    }
    res.redirect(req.session.returnTo);
    delete req.session.returnTo
    req.flash('success', `Welcome back, ${username}!`)
}

module.exports.logout = (req,res)=>{
    req.logOut();
    req.flash('success', 'Logged out, goodbye!')
    res.redirect('/campgrounds')
}